const { User, Transaction, WithdrawalRequest, SavingsGoal, GroupMember } = require('./models');

async function auditAdmins() {
  const emails = ['admin@susupay.com', 'sidneylewis27@gmail.com'];
  const results = {};
  for (const email of emails) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      results[email] = {
        id: user.id,
        fullName: user.fullName,
        balance: parseFloat(user.balance),
        role: user.role,
        transactions: await Transaction.count({ where: { UserId: user.id } }),
        withdrawals: await WithdrawalRequest.count({ where: { UserId: user.id } }),
        goals: await SavingsGoal.count({ where: { UserId: user.id } }),
        groupMemberships: await GroupMember.count({ where: { UserId: user.id } })
      };
    } else {
      results[email] = "NOT_FOUND";
    }
  }
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

auditAdmins().catch(err => {
  console.error(err);
  process.exit(1);
});
