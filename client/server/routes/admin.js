const express = require('express');
const router = express.Router();
const { User, Transaction, SavingsGoal, WithdrawalRequest, sequelize } = require('../models');
const { Op } = require('sequelize');
const adminMiddleware = require('../middleware/admin');

// Apply adminMiddleware to all routes below
router.use(adminMiddleware);

// Advanced Transaction Reporting
router.get('/reports/transactions', async (req, res) => {
  try {
    const { startDate, endDate, type, provider } = req.query;
    let where = {};

    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (type) where.type = type;
    if (provider) where.provider = provider;

    const data = await Transaction.findAll({
      where,
      include: [{ model: User, attributes: ['fullName', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Reporting fetch failed' });
  }
});

// Get All Withdrawal Requests
router.get('/withdrawals', async (req, res) => {
  try {
    const requests = await WithdrawalRequest.findAll({
      include: [{ model: User, attributes: ['fullName', 'email', 'balance'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch withdrawal requests' });
  }
});

// Update User KYC Status
router.patch('/users/:id/kyc', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Only admins can update KYC' });
  }
  try {
    const { status, adminNote } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ 
      kycStatus: status,
      adminNote: adminNote || null
    });
    res.json({ message: 'KYC status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update KYC' });
  }
});

// Update Withdrawal Status
router.patch('/withdrawals/:id', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Only admins can approve/reject withdrawals' });
  }
  const t = await sequelize.transaction();
  try {
    const { status, adminNotes } = req.body;
    const merchantNumber = process.env.MERCHANT_NUMBER || '0246814468';
    
    const request = await WithdrawalRequest.findByPk(req.params.id, { 
      include: [User],
      transaction: t
    });
    
    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: 'Request not found' });
    }

    // Handle APPROVAL logic
    if (status === 'APPROVED' && request.status === 'PENDING') {
      const user = request.User;
      if (user.balance < request.amount) {
        await t.rollback();
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      const newBalance = parseFloat(user.balance) - parseFloat(request.amount);
      await user.update({ balance: newBalance }, { transaction: t });

      // Create a Transaction record for the withdrawal
      await Transaction.create({
        type: 'WITHDRAWAL',
        amount: request.amount,
        status: 'SUCCESS',
        provider: 'PAYSTACK',
        reference: `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        UserId: user.id,
        metadata: {
          merchantNumber: merchantNumber,
          momoNumber: request.momoNumber,
          momoProvider: request.momoProvider,
          requestId: request.id
        }
      }, { transaction: t });
      
      // Update the request with merchant number
      await request.update({ 
        status, 
        adminNotes, 
        merchantNumber 
      }, { transaction: t });
    } else {
      await request.update({ status, adminNotes }, { transaction: t });
    }

    await t.commit();
    res.json({ message: `Withdrawal request ${status.toLowerCase()} successfully`, request });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update withdrawal status', error: error.message });
  }
});

// Get System Overview (Liquidity & Totals)
router.get('/overview', async (req, res) => {
  try {
    const totalLiquidity = await User.sum('balance');
    const totalUsers = await User.count();
    const totalTransactions = await Transaction.count();
    const activeGoals = await SavingsGoal.count({ where: { status: 'ACTIVE' } });
    const pendingKYC = await User.count({ where: { kycStatus: 'PENDING' } });

    res.json({ totalLiquidity, totalUsers, totalTransactions, activeGoals, pendingKYC });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overview' });
  }
});

// Get Recent Transactions (Last 10)
router.get('/recent-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      limit: 10,
      include: [{ model: User, attributes: ['fullName', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent transactions' });
  }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get Detailed Analytics for Performance Hub
router.get('/analytics', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Transaction Volume (Last 7 Days)
    const volume = await Transaction.findAll({
      where: { 
        status: 'SUCCESS',
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        'type'
      ],
      group: ['date', 'type'],
      order: [['date', 'ASC']]
    });

    // 2. KYC Distribution
    const kycStats = await User.findAll({
      attributes: [
        'kycStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['kycStatus']
    });

    // 3. Provider Share
    const providers = await Transaction.findAll({
      attributes: [
        'provider',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['provider']
    });

    res.json({ 
      volumeData: volume, 
      kycDistribution: kycStats, 
      providerShare: providers 
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Failed to compile analytics' });
  }
});

module.exports = router;
