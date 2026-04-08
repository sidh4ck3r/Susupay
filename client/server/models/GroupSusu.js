const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GroupSusu', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contributionAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY'),
      defaultValue: 'WEEKLY',
    },
    totalPot: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'ACTIVE', 'COMPLETED'),
      defaultValue: 'OPEN',
    },
    nextPayoutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  });
};
