const { WithdrawalRequest } = require('./server/models');

async function deletePayout() {
  try {
    const deletedCount = await WithdrawalRequest.destroy({
      where: {
        amount: 1.00,
        status: 'REJECTED'
      }
    });

    console.log(`✅ Success: Deleted ${deletedCount} rejected withdrawal request(s) of ₵1.00.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error deleting payout:', err);
    process.exit(1);
  }
}

deletePayout();
