const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Account extends Model {}
  Account.init({
    email : DataTypes.STRING,
    pubkey: DataTypes.STRING(1024),
  }, { sequelize, tableName: 'account' })
};
