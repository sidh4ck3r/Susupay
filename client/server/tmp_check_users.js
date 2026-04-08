const { User, Transaction, SavingsGoal, WithdrawalRequest, GroupMember, sequelize } = require('./models');

async function checkUsers() {
  const emails = ['bashiru@susupay.com', 'busali@gmail.com', 'admin@susupay.com'];
  const results = [];
  for (const email of emails) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const counts = {
        email: user.email,
        fullName: user.fullName,
        transactions: await Transaction.count({ where: { UserId: user.id } }),
        goals: await SavingsGoal.count({ where: { UserId: user.id } }),
        withdrawals: await WithdrawalRequest.count({ where: { UserId: user.id } }),
        groupMemberships: await GroupMember.count({ where: { UserId: user.id } })
      };
      results.push(counts);
    }
  }
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

checkUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
