const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            email:{
                type: Sequelize.STRING(30),
                allowNull: false,
                unique: true,
            },
            password:{
                type: Sequelize.STRING(1000),
                allowNull: false,
            },
            created_at:{
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            github_name:{
                type: Sequelize.STRING(50),
            },
            kakao_name:{
                type: Sequelize.STRING(50),
            },
            log_profile_img:{
                type:Sequelize.STRING(100),
                defaultValue: null,
            },
            login_as:{
                type: Sequelize.STRING(20),
            }
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }
    static associatie(db){}
}