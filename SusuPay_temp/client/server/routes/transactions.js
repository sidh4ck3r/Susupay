const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Transaction, User, WithdrawalRequest } = require('../models');

// Request a Withdrawal
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, momoNumber, momoProvider } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    const request = await WithdrawalRequest.create({
      amount,
      momoNumber,
      momoProvider,
      status: 'PENDING',
      UserId: userId
    });

    res.status(201).json({ message: 'Withdrawal request submitted', request });
  } catch (error) {
    res.status(500).json({ message: 'Withdrawal request failed', error: error.message });
  }
});

// Create a new MoMo Deposit (Paystack Integration)
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, provider, momoNumber, reference } = req.body;

    // 1. Check if User Exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Initialize Paystack Transaction
    const merchantNumber = '0246814468';
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: Math.round(parseFloat(amount) * 100), // convert to pesewas
        reference: reference,
        callback_url: `${process.env.CLIENT_URL || 'http://localhost:3030'}/dashboard`,
        metadata: {
          userId: user.id,
          momoNumber: momoNumber,
          provider: provider,
          merchantNumber: merchantNumber
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!paystackResponse.data.status) {
      throw new Error('Paystack initialization failed');
    }

    // 3. Create the Transaction Record (PENDING)
    const transaction = await Transaction.create({
      type: 'DEPOSIT',
      amount,
      provider,
      reference,
      status: 'PENDING',
      metadata: { momoNumber, merchantNumber },
      UserId: userId
    });

    // 4. Return Paystack Auth URL to Frontend
    res.status(201).json({ 
      message: 'Transaction initialized', 
      authorization_url: paystackResponse.data.data.authorization_url,
      reference: reference
    });

  } catch (error) {
    console.error('Deposit Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Transaction failed to initialize', 
      error: error.response?.data?.message || error.message 
    });
  }
});

// Get User Withdrawal Requests
router.get('/withdrawals/:userId', async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.findAll({
      where: { UserId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
});

// Get User Transaction History
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await Transaction.findAll({
      where: { UserId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

module.exports = router;
