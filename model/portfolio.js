const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Portfolio extends Model {}
  Portfolio.init({
    account    : DataTypes.INTEGER,
    name       : DataTypes.STRING,
    exchange   : DataTypes.STRING,
    strategy   : DataTypes.STRING,
    credentials: DataTypes.STRING(1024),
  }, { sequelize, tableName: 'portfolio' })
};
