const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
      defaultValue: 'PENDING',
    },
    provider: {
      type: DataTypes.STRING, // e.g., 'PAYSTACK', 'CASH'
      defaultValue: 'PAYSTACK',
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  });
};
