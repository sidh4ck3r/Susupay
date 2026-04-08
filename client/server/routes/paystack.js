const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Transaction, User, sequelize } = require('../models');

// Paystack Webhook Endpoint
router.post('/webhook', async (req, res) => {
  try {
    // 1. Verify Signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;

    // 2. Handle successful charges
    if (event.event === 'charge.success') {
      const { reference, amount, metadata, customer } = event.data;
      const actualAmount = amount / 100; // Paystack sends in pesewas

      const t = await sequelize.transaction();
      try {
        // Robust Metadata Handling
        let parsedMetadata = metadata;
        if (typeof metadata === 'string') {
          try {
            parsedMetadata = JSON.parse(metadata);
          } catch (e) {
            console.error('Metadata parsing failed:', e);
          }
        }

        // Find user by metadata ID or Fallback to Email
        const userId = parsedMetadata?.userId;
        let user;
        
        if (userId) {
          user = await User.findByPk(userId);
        }

        if (!user && customer?.email) {
          // Fallback to customer email
          user = await User.findOne({ where: { email: customer.email } });
        }

        if (user) {
          // Update or Create Transaction
          const merchantNumber = process.env.MERCHANT_NUMBER || '0246814468';
          await Transaction.upsert({
            reference,
            type: 'DEPOSIT',
            amount: actualAmount,
            status: 'SUCCESS',
            provider: 'PAYSTACK',
            UserId: user.id,
            metadata: { 
              ...parsedMetadata, 
              merchantNumber: merchantNumber 
            }
          }, { transaction: t });

          // Update Balance
          const newBalance = parseFloat(user.balance) + actualAmount;
          await user.update({ balance: newBalance }, { transaction: t });
          console.log(`✅ Success: Deposited ₵${actualAmount} to ${user.email}`);
        } else {
          console.error(`❌ User not found for transaction ${reference}. Email: ${customer?.email}`);
        }

        await t.commit();
      } catch (err) {
        await t.rollback();
        console.error('Webhook processing error:', err);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Security Error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
