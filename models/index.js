const Sequelize = require('sequelize');
const User = require('./users');
const Token = require('./token');
const Video = require('./videos');
const Comment = require('./cooments');

const env = process.env.NOVE_DEV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.databse, config.username, config.password, config
);

db.sequelize = sequelize;
db.User = User;
db.Token = Token;
db.Video = Video;
db.Comment = Comment;

User.init(sequelize);
Token.init(sequelize);
Video.init(sequelize);
Comment.init(sequelize);

module.exports = db;