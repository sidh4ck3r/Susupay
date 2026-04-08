const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GroupMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('MEMBER', 'ADMIN'),
      defaultValue: 'MEMBER',
    },
    payoutOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hasReceivedPayout: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    totalContributed: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'LEFT'),
      defaultValue: 'ACTIVE',
    }
  });
};
