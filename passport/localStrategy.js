
const passport = require('passport');
const local_strategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/users');

module.exports = () => {
    passport.use(new local_strategy({
        usernameField: 'email',
        passwordField: 'passwd',
    }, async(email, passwd, done) => {
        try{
            const ex_user = await User.findOne({
                where:{email},
            });
            if(ex_user){
                const result = await bcrypt.compare(passwd, ex_user.password);
                User.update(
                    {login_as: 'local'},
                    {where: {id: ex_user.id}}
                )
                result ? done(null, ex_user) : done(null, false, {message: 'wrong password'});
            }
            else{
                done(null, false, {message: 'Did not signup yet'});
            }
        }
        catch(err){
            console.error(err);
            done(err);
        }
    }));
}