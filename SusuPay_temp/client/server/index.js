const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize, User, Transaction, SavingsGoal, WithdrawalRequest, GroupSusu, GroupMember } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ MariaDB connection established.');
    
    // Sync Database
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 SusuPay API running on http://localhost:${PORT}`);
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
