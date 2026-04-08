const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = 'naomineeokpey@gmail.com';
  const newPassword = 'Admin@#$';
  
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    // Manual hash and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await user.update({ password: hashedPassword });

    console.log(`✅ Success: Password for ${user.fullName} (${email}) has been reset.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    process.exit(1);
  }
}

resetPassword();
