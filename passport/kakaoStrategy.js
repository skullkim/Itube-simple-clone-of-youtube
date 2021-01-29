const passport = require('passport');
const kakoStrategy = require('passport-kakao').Strategy;
const User = require('../models/users');

module.exports = () => {
    passport.use(new kakoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/login/kakao/callback'
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            console.log('kakao', profile);
            const ex_user = await User.findOne({
                where: {kakao_name: profile.username}
            });
            if(ex_user){
                done(null, ex_user);
            }
            else{
                const email = profile._json.kakao_account.email || '';
                const new_user = await User.create({
                    name: profile.username,
                    email,
                    password: '',
                    kakao_name: profile.username,
                });
                done(null, new_user);
            }
        }
        catch(err){
            console.error(err);
            done(err);
        }        
    }));
};