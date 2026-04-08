const { User, Transaction, WithdrawalRequest, SavingsGoal, GroupMember, sequelize } = require('./models');

async function migrateAndCleanup() {
  const t = await sequelize.transaction();
  try {
    const targetEmail = 'sidneylewis27@gmail.com';
    const deleteEmails = ['admin@susupay.com', 'bashiru@susupay.com', 'busali@gmail.com'];
    
    // 1. Ensure target user is ADMIN
    const targetUser = await User.findOne({ where: { email: targetEmail }, transaction: t });
    if (!targetUser) throw new Error(`Target user ${targetEmail} not found`);
    
    await targetUser.update({ 
      role: 'ADMIN', 
      balance: 6.00 // Reconciliation of 5.00 + 1.00
    }, { transaction: t });
    console.log(`Updated ${targetEmail} to ADMIN with balance 6.00`);

    // 2. Create Audit Transaction for the reconciliation
    await Transaction.create({
      type: 'DEPOSIT',
      amount: 6.00,
      status: 'SUCCESS',
      provider: 'SYSTEM_AUDIT',
      reference: `AUDIT-RECON-${Date.now()}`,
      metadata: { notes: 'Consolidated legacy balances and today\'s missing ₵1.00 deposit during account migration.' },
      UserId: targetUser.id
    }, { transaction: t });
    console.log(`Created audit reconciliation transaction for 6.00`);

    // 3. For each user to be deleted, move/delete related records
    for (const email of deleteEmails) {
      const user = await User.findOne({ where: { email }, transaction: t });
      if (!user) {
        console.log(`User ${email} already gone or not found. Skipping.`);
        continue;
      }

      console.log(`Cleaning up records for ${email} (ID: ${user.id})...`);
      
      // Delete child records to ensure no foreign key issues
      await Transaction.destroy({ where: { UserId: user.id }, transaction: t });
      await WithdrawalRequest.destroy({ where: { UserId: user.id }, transaction: t });
      await SavingsGoal.destroy({ where: { UserId: user.id }, transaction: t });
      await GroupMember.destroy({ where: { UserId: user.id }, transaction: t });

      // Delete the user
      await user.destroy({ transaction: t });
      console.log(`Deleted user ${email}`);
    }

    await t.commit();
    console.log('Migration and Cleanup successful!');
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateAndCleanup();
