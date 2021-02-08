const Sequelize = require('sequelize');

module.exports = class Video extends Sequelize.Model{
    static init (sequelize){
        return super.init({
            video_user:{
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            video:{
                type: Sequelize.STRING(1000),
                allowNull: false,
            },
            video_name:{
                type: Sequelize.STRING(1000),
            },
            sumail:{
                type: Sequelize.STRING(1000),
            },
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Video',
            tableName: 'videos',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associations(db){
        db.User.belongsTo(db.User, {foreignkey: 'video_user', targeyKey: 'id'});
    }
}