const { User, Transaction } = require('./models');

async function checkUsers() {
  try {
    const emails = ['Solomonkabu1634@gmail.com', 'sidneylewis27@gmail.com'];
    const users = await User.findAll({ where: { email: emails } });
    
    console.log('--- USER PROFILES ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`ID: ${u.id}`);
      console.log(`Balance: ${u.balance}`);
      console.log(`KYC Status: ${u.kycStatus}`);
      console.log('---------------------');
    });

    const transactions = await Transaction.findAll({
      where: { UserId: users.map(u => u.id) },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log('\n--- RECENT TRANSACTIONS ---');
    transactions.forEach(t => {
      console.log(`Ref: ${t.reference} | Type: ${t.type} | Amount: ${t.amount} | Status: ${t.status} | User: ${t.UserId}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUsers();
