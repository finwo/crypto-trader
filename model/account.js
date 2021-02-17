const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Account extends Model {}
  Account.init({
    email   : DataTypes.STRING,
    password: DataTypes.STRING,
  }, { sequelize, tableName: 'account' })
};
