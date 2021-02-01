const passport = require('passport');
const kakoStrategy = require('passport-kakao').Strategy;
const User = require('../models/users');
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
            const ex_user = await User.findOne({
                where: {kakao_name: profile.username}
            });
            const path = profile._json.properties.profile_image;
            console.log(path);
            const profile_img = `kakao-profile-${Date.now()}.jpg`;
            axios.get(path, {
                headers: {Authorization: `Bearer ${accessToken}`},
                responseType: 'stream',
            })
                .then(async (response) => {
                   response.data.pipe(fs.createWriteStream(`./upload/${profile_img}`));
                })
                .catch(err => {
                    console.error(err);
                })
            if(ex_user){
                await User.update(
                    {login_as: 'kakao', kakao_name: profile.username, log_profile_img: `/upload/${profile_img}`},
                    {where: {kakao_name: profile.username}}
                );
                done(null, ex_user);
            }
            else{
                const email = profile._json.kakao_account.email || '';
                const new_user = await User.create({
                    name: profile.username,
                    email,
                    password: '',
                    kakao_name: profile.username,
                    log_profile_img: `/upload/${profile_img}` ,
                    login_as: 'kakao',
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