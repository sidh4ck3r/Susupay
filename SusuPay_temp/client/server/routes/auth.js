const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Note: In a larger app, we'd pass the initialized models from index.js
// To avoid circular dependencies, we should ideally not require index.js here
// If User is undefined, that's likely the circular dependency issue.
const models = require('../models'); 
const { User } = models;

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, momoNumber, momoProvider, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Safety: Don't allow registration as ADMIN or AUDITOR through public endpoint
    const finalRole = (role === 'ADMIN' || role === 'AUDITOR') ? 'CUSTOMER' : (role || 'CUSTOMER');

    const user = await User.create({ 
      fullName, 
      email, 
      password, 
      momoNumber, 
      momoProvider, 
      role: finalRole 
    });
    
    res.status(201).json({ message: 'Account created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role, balance: user.balance } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get User Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'fullName', 'email', 'role', 'balance', 'momoNumber', 'momoProvider', 'kycStatus']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
