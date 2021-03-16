const passport = require('passport');
const kakoStrategy = require('passport-kakao').Strategy;
const User = require('../models/users');
const Token = require('../models/token');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const AWS = require('aws-sdk');
const stream = require('stream');
const s3Stream = require('s3-streams');

function uploadStream(s3, key){
    const pass = new stream.PassThrough();
    s3.upload({
        Bucket: `${process.env.AWS_S3_BUCKET}`,
        Key: key,
        Body: pass,
    });
    return pass;
}

module.exports = () => {
    passport.use(new kakoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/login/kakao/callback'
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            //find user
            const ex_user = await User.findOne({
                where: {kakao_name: profile.username}
            });
            //find profile image in API server
            const path = profile._json.properties.profile_image;
            const key = `upload/profile/kakao/kakao-profile-${Date.now()}.jpg`
            axios.get(path, {
                headers: {Authorization: `Bearer ${accessToken}`},
                responseType: 'stream',
            })
                .then(async (response) => {
                    //save profile image
                    console.log("response data");
                    //console.log(response.data);
                    const s3 = new AWS.S3();
                    response.data.pipe(s3Stream.WriteStream(s3, {
                        Bucket: `${process.env.AWS_S3_BUCKET}`,
                        Key: key,
                    }));
                })
                .catch(err => {
                    console.error(err);
                });

            //if already signed up
            if(ex_user){
                //update name, profile image
                await User.update(
                    {login_as: 'kakao', kakako_name: profile.username, log_profile_img: `${path}`, profile_key: `${key}`},
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
                    log_profile_img: `${path}`,
                    login_as: 'kakao',
                    profile_key: `${key}`,
                });
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