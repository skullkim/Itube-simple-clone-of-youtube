const Sequelize = require('sequelize');

module.exports = class Token extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            user_id:{
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            kakao_auth:{
                type: Sequelize.STRING(10000),
            },
            kakao_refresh:{
                type: Sequelize.STRING(1000),
            },
            git_auth:{
                type: Sequelize.STRING(1000),
            },
            git_refresh:{
                type: Sequelize.STRING(1000),
            },
            git_id:{
                type: Sequelize.INTEGER,
            },
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Token',
            tableName: 'token',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db){
        db.User.belongsTo(db.User, {foreignKey: 'id', targetKey: 'id'});
    }
};