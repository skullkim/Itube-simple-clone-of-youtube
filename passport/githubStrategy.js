const passport = require('passport');
const githubStrategy = require('passport-github').Strategy;
const User = require('../models/users');
const { response } = require('express');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
module.exports = () => passport.use(new githubStrategy({
        clientID: "1f6fbd0c8fe0805c2d32",
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/login/github/callback"
    }, async (aceessToken, refreshToken, profile, done) => {
        try{
            console.log('github', profile.photos[0].value);
            const ex_user = await User.findOne({
              where: {github_name: profile.username}  
            });
            const img_path = profile.photos[0].value;
            const profile_img = `github-profile-${Date.now()}.jpg`
            axios.get(img_path, {
                responseType: 'stream',
            })
                .then((response) => {
                    response.data.pipe(fs.createWriteStream(`./upload/${profile_img}`));
                })
                .catch(err => {
                    console.error(err);
                })
            if(ex_user){
                await User.update(
                    {login_as: 'github', github_name: profile.username, log_profile_img: `/upload/${profile_img}`},
                    {where: {github_name: profile.username}}
                );
                done(null, ex_user);
            }
            else{
                const email = profile._json.email || '';
                const new_user = await User.create({
                    name: profile._json.login,
                    email,
                    password: '',
                    github_name: profile.username,
                    log_profile_img: `'/upload/${profile_img}`,
                    login_as: 'github',
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