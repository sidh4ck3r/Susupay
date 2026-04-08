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
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.ENUM('MTN', 'VODAFONE', 'AIRTELTIGO', 'TELECEL', 'AT'),
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    kycStatus: {
      type: DataTypes.ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'),
      defaultValue: 'UNVERIFIED',
    },
    idType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
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
