const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize, User, Transaction, SavingsGoal, WithdrawalRequest, GroupSusu, GroupMember } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// GLOBAL TRAFFIC LOGGER (Diagnostic)
app.use((req, res, next) => {
  console.log(`\n📢 [${new Date().toLocaleTimeString()}] Connection attempt from: ${req.ip}`);
  console.log(`   Path: ${req.method} ${req.url}`);
  next();
});

// PING TEST ROUTE
app.get('/ping', (req, res) => {
  res.send('pong - SusuPay API is Reachable!');
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ MariaDB connection established.');
    
    // Sync Database
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 SusuPay API running on port ${PORT} (Network Shared)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please kill the process using it.`);
      } else {
        console.error('❌ Server error:', err);
      }
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/collector', require('./routes/collector'));
app.use('/api/paystack', require('./routes/paystack'));
app.use('/api/groups', require('./routes/groups'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'SusuPay API', status: 'Healthy' });
});

startServer();
