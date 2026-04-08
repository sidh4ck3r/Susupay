const { User } = require('./models');

async function checkUserPassword() {
  const email = 'naomineeokpey@gmail.com';
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['fullName', 'email', 'password', 'googleId']
    });

    if (user) {
      console.log('User Found:');
      console.log(`Full Name: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Has Password: ${user.password ? 'Yes (Hashed)' : 'No'}`);
      console.log(`Has Google ID: ${user.googleId ? 'Yes' : 'No'}`);
      if (user.password) {
        console.log(`Password Hash: ${user.password}`);
      }
    } else {
      console.log(`User with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error fetching user:', err);
    process.exit(1);
  }
}

checkUserPassword();
