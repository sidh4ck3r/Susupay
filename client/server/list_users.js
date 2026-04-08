const { User } = require('./models');

async function listAllUsers() {
  try {
    const users = await User.findAll({
      attributes: ['email', 'fullName']
    });
    console.log('All Registered Users:');
    users.forEach(u => console.log(`- ${u.fullName} (${u.email})`));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }
}

listAllUsers();
