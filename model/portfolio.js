const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Portfolio extends Model {}
  Portfolio.init({
    account      : DataTypes.INTEGER,
    name         : DataTypes.STRING,
    baseCurrency : DataTypes.STRING,
    exchange     : DataTypes.STRING,
    strategy     : DataTypes.STRING(4096),
    tradegap     : DataTypes.DOUBLE,
    credentials  : DataTypes.STRING(1024),
    markets      : DataTypes.STRING(4096),
  }, { sequelize, tableName: 'portfolio' })
};
