const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('SavingsGoal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'General',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'ACTIVE',
    }
  });
};
