const Sequelize = require('sequelize');
const User = require('./users');
const Token = require('./token');

const env = process.env.NOVE_DEV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.databse, config.username, config.password, config
);

db.sequelize = sequelize;
db.User = User;
db.Token = Token;

User.init(sequelize);
Token.init(sequelize);

module.exports = db;