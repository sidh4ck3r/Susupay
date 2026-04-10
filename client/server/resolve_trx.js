const { User, Transaction, sequelize } = require('./models');

async function resolveTransaction(reference) {
  const t = await sequelize.transaction();
  try {
    const transaction = await Transaction.findOne({ where: { reference }, transaction: t });
    if (!transaction) {
      console.log('❌ Transaction not found');
      await t.rollback();
      return;
    }

    if (transaction.status === 'SUCCESS') {
      console.log('⚠️ Transaction is already SUCCESSful');
      await t.rollback();
      return;
    }

    const user = await User.findByPk(transaction.UserId, { transaction: t });
    if (!user) {
      console.log('❌ User not found');
      await t.rollback();
      return;
    }

    // 1. Update Transaction Status
    await transaction.update({ status: 'SUCCESS' }, { transaction: t });
    console.log(`✅ Transaction ${reference} status updated to SUCCESS`);

    // 2. Update User Balance
    const newBalance = parseFloat(user.balance || 0) + parseFloat(transaction.amount);
    await user.update({ balance: newBalance }, { transaction: t });
    console.log(`✅ User ${user.email} balance updated: ${user.balance} -> ${newBalance}`);

    await t.commit();
    console.log('🎉 Manual resolution completed successfully.');
  } catch (err) {
    await t.rollback();
    console.error('❌ Resolution failed:', err);
  } finally {
    process.exit();
  }
}

const ref = 'TRX-1775769708966-540';
resolveTransaction(ref);
