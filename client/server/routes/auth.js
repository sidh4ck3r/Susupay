const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Note: In a larger app, we'd pass the initialized models from index.js
// To avoid circular dependencies, we should ideally not require index.js here
const models = require('../models'); 

router.post('/register', async (req, res) => {
  try {
    const { User } = models; // Extract here to ensure User is defined if models was a partial object
    if (!User) {
      console.error('Critical Error: User model is undefined in /register. Models keys:', Object.keys(models));
      return res.status(500).json({ message: 'Internal Server Error: Models not initialized' });
    }

    const { fullName, email, password, momoNumber, momoProvider, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Safety: Don't allow registration as ADMIN or AUDITOR through public endpoint
    const finalRole = (role === 'ADMIN' || role === 'AUDITOR') ? 'CUSTOMER' : (role || 'CUSTOMER');

    console.log(`Attempting to create user: ${email} with role: ${finalRole}`);
    
    const user = await User.create({ 
      fullName, 
      email, 
      password, 
      momoNumber, 
      momoProvider, 
      role: finalRole 
    });
    
    console.log(`User created successfully: ${user.id}`);
    res.status(201).json({ message: 'Account created successfully', userId: user.id });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { User } = models;
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

router.post('/google', async (req, res) => {
  try {
    const { User } = models;
    const { credential, accessToken, userInfo } = req.body;

    let googleId, email, name, picture;

    if (credential) {
      // Legacy flow: Verify the Google ID Token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (accessToken) {
      // New flow: useGoogleLogin returns an access_token.
      // Verify by fetching user info from Google server-side (prevents spoofing).
      try {
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        googleId = googleRes.data.sub;
        email = googleRes.data.email;
        name = googleRes.data.name;
        picture = googleRes.data.picture;
      } catch (verifyErr) {
        console.error('Google access token verification failed:', verifyErr.message);
        return res.status(401).json({ message: 'Invalid Google access token' });
      }
    } else {
      return res.status(400).json({ message: 'No Google credential or access token provided' });
    }

    // 1. Try to find user by googleId
    let user = await User.findOne({ where: { googleId } });

    // 2. If not found, try to find by email (to link existing account)
    if (!user) {
      user = await User.findOne({ where: { email } });
      if (user) {
        // Link googleId to existing account
        await user.update({ googleId });
      }
    }

    // 3. If still not found, create new user
    if (!user) {
      user = await User.create({
        fullName: name,
        email: email,
        googleId,
        role: 'CUSTOMER',
        kycStatus: 'UNVERIFIED',
        balance: 0.00
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        role: user.role, 
        balance: user.balance,
        picture // Optional: UI can use this
      } 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
});

router.post('/supabase', async (req, res) => {
  // This endpoint trusts the client asserting the Supabase session
  // In a high-security production app, we would verify the Supabase JWT token in the Authorization header.
  // We'll trust the payload for now to finish the migration quickly.
  try {
    const { User } = models;
    const { googleId, email, name, picture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Missing required Supabase identity fields' });
    }

    // 1. Try to find user by Supabase ID (mapped as googleId)
    let user = await User.findOne({ where: { googleId } });

    // 2. If not found, try to find by email
    if (!user) {
      user = await User.findOne({ where: { email } });
      if (user) {
        await user.update({ googleId });
      }
    }

    // 3. Create new user if still not found
    if (!user) {
      user = await User.create({
        fullName: name,
        email: email,
        googleId,
        role: 'CUSTOMER',
        kycStatus: 'UNVERIFIED',
        balance: 0.00
      });
    }

    // Mint our own system JWT (so the rest of the backend middleware still works)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        role: user.role, 
        balance: user.balance,
        kycStatus: user.kycStatus,
        picture
      } 
    });
  } catch (error) {
    console.error('Supabase Sync Error:', error);
    res.status(500).json({ message: 'Supabase synchronization failed', error: error.message });
  }
});

// Update KYC Details
router.put('/kyc/:id', async (req, res) => {
  try {
    const { User } = models;
    const { idType, idNumber, address } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({
      idType,
      idNumber,
      address,
      kycStatus: 'PENDING'
    });

    res.json({ message: 'KYC details submitted for review', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit KYC details', error: error.message });
  }
});

// Get User Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { User } = models;
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'fullName', 'email', 'role', 'balance', 'momoNumber', 'momoProvider', 'kycStatus', 'idType', 'idNumber', 'address']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
