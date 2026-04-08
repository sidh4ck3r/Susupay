const express = require('express');
const router = express.Router();
const { SavingsGoal, User } = require('../models');

// Create a new Savings Goal
router.post('/', async (req, res) => {
  try {
    const { userId, title, targetAmount, deadline, category } = req.body;

    const goal = await SavingsGoal.create({
      title,
      targetAmount,
      deadline,
      category,
      UserId: userId
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create savings goal', error: error.message });
  }
});

// Get User Savings Goals
router.get('/:userId', async (req, res) => {
  try {
    const goals = await SavingsGoal.findAll({
      where: { UserId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch savings goals' });
  }
});

module.exports = router;
