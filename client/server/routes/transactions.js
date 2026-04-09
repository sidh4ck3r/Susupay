const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Transaction, User, WithdrawalRequest, GroupMember, sequelize } = require('../models');

// Request a Withdrawal
router.post('/withdraw', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { userId, amount, momoNumber, momoProvider } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    if (parseFloat(user.balance) < withdrawAmount) {
      await t.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 1. Create Withdrawal Request (For Admin Approval)
    const request = await WithdrawalRequest.create({
      amount: withdrawAmount,
      momoNumber,
      momoProvider,
      status: 'PENDING',
      UserId: userId
    }, { transaction: t });

    // 2. Create Audit Transaction (Type: WITHDRAWAL, Status: PENDING)
    const reference = `WDL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await Transaction.create({
      type: 'WITHDRAWAL',
      amount: withdrawAmount,
      provider: momoProvider,
      reference: reference,
      status: 'PENDING',
      UserId: userId,
      metadata: { momoNumber, requestId: request.id }
    }, { transaction: t });

    // 3. Deduct Balance Immediately
    const newBalance = parseFloat(user.balance) - withdrawAmount;
    await user.update({ balance: newBalance }, { transaction: t });

    await t.commit();
    res.status(201).json({ 
      message: 'Withdrawal request submitted and balance updated.', 
      newBalance,
      requestId: request.id 
    });
  } catch (error) {
    await t.rollback();
    console.error('Withdrawal Error:', error);
    res.status(500).json({ message: 'Withdrawal request failed', error: error.message });
  }
});

// Create a new MoMo Deposit (Paystack Integration)
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, provider, momoNumber, reference, groupId } = req.body;

    // 1. Check if User Exists & KYC Status
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.kycStatus !== 'VERIFIED') {
      return res.status(403).json({ 
        message: 'KYC Verification Required', 
        details: 'You must complete KYC verification before making a deposit.',
        kycStatus: user.kycStatus
      });
    }

    // 2. Initialize Paystack Transaction
    const merchantNumber = process.env.MERCHANT_NUMBER || '0246814468';
    
    // Dynamic Callback URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://susupay.vercel.app' 
      : (process.env.CLIENT_URL || 'http://localhost:3030');
      
    const callbackUrl = `${baseUrl}/dashboard`;

    console.log(`🚀 Initializing Deposit: ${amount} GHS for ${user.email}. Callback: ${callbackUrl}`);

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: Math.round(parseFloat(amount) * 100), // convert to pesewas
        reference: reference,
        callback_url: callbackUrl,
        channels: ['mobile_money', 'card'], // Ensure MoMo is explicitly included
        metadata: {
          userId: user.id,
          momoNumber: momoNumber,
          provider: provider,
          merchantNumber: merchantNumber,
          groupId: groupId // Pass groupId to track Susu contributions
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
    await Transaction.create({
      type: 'DEPOSIT',
      amount,
      provider,
      reference,
      status: 'PENDING',
      metadata: { momoNumber, merchantNumber, groupId, initiateTimestamp: new Date().toISOString() },
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

// Verify Paystack Transaction
router.get('/verify/:reference', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { reference } = req.params;
    
    // 1. Verify with Paystack
    const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const verifyData = paystackRes.data.data;
    if (verifyData.status !== 'success') {
      await t.rollback();
      return res.status(400).json({ message: 'Transaction was not successful' });
    }

    // 2. Find internal transaction
    const transaction = await Transaction.findOne({ where: { reference }, transaction: t });
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ message: 'Transaction not found in our system' });
    }

    // 3. If already successful, skip update
    if (transaction.status === 'SUCCESS') {
      await t.rollback();
      return res.json({ message: 'Already verified', transaction });
    }

    // 4. Mark success and update user balance
    await transaction.update({ status: 'SUCCESS' }, { transaction: t });
    
    const user = await User.findByPk(transaction.UserId, { transaction: t });
    const newBalance = parseFloat(user.balance) + parseFloat(transaction.amount);
    await user.update({ balance: newBalance }, { transaction: t });

    // 5. IF THIS IS A GROUP SUSU CONTRIBUTION, CREDIT THE GROUP MEMBER
    if (transaction.metadata && transaction.metadata.groupId) {
      const groupMember = await GroupMember.findOne({
        where: {
          GroupSusuId: transaction.metadata.groupId,
          UserId: transaction.UserId
        },
        transaction: t
      });

      if (groupMember) {
        const newTotal = parseFloat(groupMember.totalContributed || 0) + parseFloat(transaction.amount);
        await groupMember.update({ totalContributed: newTotal }, { transaction: t });
        console.log(`✅ Group Susu contribution updated for user ${transaction.UserId} in group ${transaction.metadata.groupId}`);
      }
    }

    await t.commit();
    res.json({ message: 'Verification successful', transaction, newBalance });
  } catch (error) {
    await t.rollback();
    console.error('Verify Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;
