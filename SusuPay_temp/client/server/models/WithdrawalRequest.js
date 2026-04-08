const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('WithdrawalRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
      defaultValue: 'PENDING',
    },
    momoNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    momoProvider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    merchantNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });
};
