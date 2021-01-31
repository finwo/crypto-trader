const { DataTypes } = require('sequelize');

module.exports = ({ db }) => db.define('Triple', {
  subject: {
    type       : DataTypes.STRING,
    allowNull  : false,
    primaryKey : true,
  },
  predicate: {
    type       : DataTypes.STRING,
    allowNull  : false,
    primaryKey : true,
  },
  object: {
    type       : DataTypes.STRING,
    allowNull  : false,
    primaryKey : true,
  },
}, {
  tableName: 'graph',
  indexes: [
    {fields: [ 'subject'   ]},
    {fields: [ 'predicate' ]},
    {fields: [ 'object'    ]},
  ],
});
