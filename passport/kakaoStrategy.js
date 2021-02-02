const passport = require('passport');
const kakoStrategy = require('passport-kakao').Strategy;
const User = require('../models/users');
const Token = require('../models/token');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');

module.exports = () => {
    passport.use(new kakoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/login/kakao/callback'
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            //console.log('leng', accessToken.length);
            //find user
            const ex_user = await User.findOne({
                where: {kakao_name: profile.username}
            });
            //find profile image in API server
            const path = profile._json.properties.profile_image;
            console.log(path);
            const profile_img = `kakao-profile-${Date.now()}.jpg`;
            axios.get(path, {
                headers: {Authorization: `Bearer ${accessToken}`},
                responseType: 'stream',
            })
                .then(async (response) => {
                    //save profile image
                   response.data.pipe(fs.createWriteStream(`./upload/${profile_img}`));
                })
                .catch(err => {
                    console.error(err);
                })
            //if already signed up
            if(ex_user){
                //update name, profile image
                await User.update(
                    {login_as: 'kakao', kakao_name: profile.username, log_profile_img: `/upload/${profile_img}`},
                    {where: {kakao_name: profile.username}}
                );
                //save token
                await Token.create(
                    {user_id: ex_user.id, kakao_auth: accessToken, kakao_refresh: refreshToken},
                    {where: {user_id: ex_user.id}}
                )
                done(null, ex_user);
            }
            //if need sign up
            else{
                //save new users' info
                const email = profile._json.kakao_account.email || '';
                const new_user = await User.create({
                    name: profile.username,
                    email,
                    password: '',
                    kakao_name: profile.username,
                    log_profile_img: `/upload/${profile_img}` ,
                    login_as: 'kakao',
                });
                //console.log(new_user.id);
                //save token
                await Token.create({
                    user_id: new_user.id,
                    kakao_auth: accessToken,
                    kakao_refresh: refreshToken,
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