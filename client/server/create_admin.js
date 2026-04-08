const { User, sequelize } = require('./models');

async function createAdmin() {
  const email = 'admin@susupay.com';
  const password = 'my$sid143';
  
  try {
    // Ensure models are synced with the new Supabase project
    await sequelize.authenticate();
    console.log('Connected to Supabase...');
    
    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    
    if (existing) {
      console.log(`User ${email} already exists. Updating role and password...`);
      await existing.update({ 
        role: 'ADMIN',
        password, // Re-hashed by the beforeCreate/beforeUpdate hook if model allows or manual hash?
        kycStatus: 'VERIFIED'
      });
      console.log('Update complete.');
    } else {
      console.log(`Creating new ADMIN user: ${email}...`);
      await User.create({
        fullName: 'System Admin',
        email,
        password, // Hashed automatically by the User model hook
        role: 'ADMIN',
        kycStatus: 'VERIFIED',
        balance: 0.00
      });
      console.log('✅ Admin user created successfully.');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
