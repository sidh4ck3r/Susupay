const { User } = require('./models');

async function getUserStatus() {
  const email = 'admin@susupay.com';
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'fullName', 'email', 'role', 'kycStatus', 'balance', 'createdAt']
    });

    if (user) {
      console.log('User Found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log(`User with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error fetching user status:', err);
    process.exit(1);
  }
}

getUserStatus();
