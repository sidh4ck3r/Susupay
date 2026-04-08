const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'COLLECTOR', 'CUSTOMER', 'AUDITOR'),
      defaultValue: 'CUSTOMER',
    },
    momoNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    momoProvider: {
      type: DataTypes.ENUM('MTN', 'VODAFONE', 'AIRTELTIGO'),
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    kycStatus: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
      defaultValue: 'PENDING',
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
