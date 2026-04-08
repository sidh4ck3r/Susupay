const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
      }
    );

// Initialize Models
const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const SavingsGoal = require('./SavingsGoal')(sequelize);
const WithdrawalRequest = require('./WithdrawalRequest')(sequelize);
const GroupSusu = require('./GroupSusu')(sequelize);
const GroupMember = require('./GroupMember')(sequelize);

// Define Relationships
User.hasMany(Transaction);
Transaction.belongsTo(User);

User.hasMany(SavingsGoal);
SavingsGoal.belongsTo(User);

User.hasMany(WithdrawalRequest);
WithdrawalRequest.belongsTo(User);

// Group Relationships
GroupSusu.belongsToMany(User, { through: GroupMember });
User.belongsToMany(GroupSusu, { through: GroupMember });
GroupSusu.hasMany(GroupMember);
GroupMember.belongsTo(GroupSusu);
User.hasMany(GroupMember);
GroupMember.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Transaction,
  SavingsGoal,
  WithdrawalRequest,
  GroupSusu,
  GroupMember
};
