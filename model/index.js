module.exports = sequelize => {
  require('./account')(sequelize);
  require('./portfolio')(sequelize);
};
