const Sequelize = require('sequelize');
//const User = require('./users');
const Video = require('./videos');

module.exports = class Comment extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            commenter:{
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            comment:{
                type: Sequelize.STRING(1000),
            }
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associations(db){
        db.Video.belongsTo(db.User, {foreignKey: 'commenter', targetKey: 'id'});
    }    
}