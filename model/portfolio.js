const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Portfolio extends Model {}
  Portfolio.init({
    account      : DataTypes.INTEGER,
    name         : DataTypes.STRING,
    baseCurrency : DataTypes.STRING,
    exchange     : DataTypes.STRING,
    strategy     : DataTypes.STRING(4096),
    credentials  : DataTypes.STRING(1024),
  }, { sequelize, tableName: 'portfolio' })
};
