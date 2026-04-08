const express = require('express');
const router = express.Router();
const { User, Transaction, sequelize } = require('../models');
const auth = require('../middleware/auth');

// Record a Cash Collection
router.post('/collect', auth(['COLLECTOR', 'ADMIN']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { collectorId, customerId, amount, notes } = req.body;
    
    // Ensure collectorId matches logged in user (if collector)
    if (req.user.role === 'COLLECTOR' && String(req.user.id) !== String(collectorId)) {
      return res.status(403).json({ message: 'Unauthorized collection attempt' });
    }

    const customer = await User.findByPk(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // 1. Create Transaction (Type: DEPOSIT, Provider: CASH)
    const transaction = await Transaction.create({
      type: 'DEPOSIT',
      amount,
      provider: 'CASH',
      status: 'SUCCESS',
      metadata: { collectorId, notes },
      UserId: customerId,
      reference: `CASH-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }, { transaction: t });

    // 2. Update Customer Balance
    const newBalance = parseFloat(customer.balance) + parseFloat(amount);
    await customer.update({ balance: newBalance }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Cash collection recorded', transaction, newBalance });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Collection failed', error: error.message });
  }
});

// Get Collector's Daily Performance
router.get('/daily/:collectorId', auth(['COLLECTOR', 'ADMIN']), async (req, res) => {
  try {
    const { collectorId } = req.params;
    
    // Ensure collector can only see their own performance
    if (req.user.role === 'COLLECTOR' && String(req.user.id) !== String(collectorId)) {
      return res.status(403).json({ message: 'Unauthorized history access' });
    }

    const collections = await Transaction.findAll({
      where: {
        provider: 'CASH',
        metadata: {
          collectorId: collectorId
        }
      },
      order: [['createdAt', 'DESC']]
    });
    // Double check filter for robustness since Sequelize JSON filtering can vary
    const filtered = collections.filter(c => c.metadata?.collectorId === collectorId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch daily collections' });
  }
});

// Get all customers for collectors
router.get('/customers', auth(['COLLECTOR', 'ADMIN']), async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'CUSTOMER' },
      attributes: ['id', 'fullName', 'balance', 'momoNumber']
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

module.exports = router;
