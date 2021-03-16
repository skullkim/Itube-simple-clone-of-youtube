const passport = require('passport');
const githubStrategy = require('passport-github').Strategy;
const User = require('../models/users');
const Token = require('../models/token');
const { response } = require('express');
const axios = require('axios');
const fs = require('fs');
const AWS = require('aws-sdk');
const s3Stream = require('s3-streams');

require('dotenv').config();
module.exports = () => passport.use(new githubStrategy({
        clientID: "1f6fbd0c8fe0805c2d32",
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/login/github/callback"
    }, async (aceessToken, refreshToken, profile, done) => {
        try{
            //console.log('github', profile);
            //find user
            const ex_user = await User.findOne({
              where: {github_name: profile.username}  
            });
            //find profile image in API server
            const img_path = profile.photos[0].value;
            const profile_img = `github-profile-${Date.now()}.jpg`
            const key = `upload/profile/github/github-profile-${Date.now()}.jpg`
            axios.get(img_path, {
                responseType: 'stream',
            })
                .then((response) => {
                    //save profile image
                    const s3 = new AWS.S3();
                    response.data.pipe(s3Stream.WriteStream(s3, {
                        Bucket: `${process.env.AWS_S3_BUCKET}`,
                        Key: key,
                    }));
                })
                .catch(err => {
                    console.error(err);
                })
            //if already signed up
            if(ex_user){
                //update name, profile image
                await User.update(
                    {
                        login_as: 'github', 
                        github_name: profile.username,
                        log_profile_img: `/upload/profile/github/${profile_img}`,
                        profile_key: `${key}`,
                    },
                    {where: {github_name: profile.username}}
                );
                //save token
                await Token.create(
                    {
                        user_id: ex_user.id, 
                        git_auth: aceessToken, 
                        git_refresh: refreshToken,
                        git_id: profile._json.id,
                    },
                    {where: {user_id: ex_user.id}},
                );
                done(null, ex_user);
            }
            //if need sign up
            else{
                //create new user info
                const email = profile._json.email || '';
                const new_user = await User.create({
                    name: profile._json.login,
                    email,
                    password: '',
                    github_name: profile.username,
                    log_profile_img: `'/upload/profile/github/${profile_img}`,
                    login_as: 'github',
                    profile_key: `${key}`,
                });
                //save token
                await Token.create({
                    user_id: new_user.id,
                    git_auth: aceessToken,
                    git_refresh: refreshToken,
                    git_id: profile._json.id,
                });
                done(null, new_user);
            }
        }
        catch(err){
            console.error(err);
            done(err);
        }
    })
);