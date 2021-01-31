const passport = require('passport');
const githubStrategy = require('passport-github').Strategy;
const User = require('../models/users');
const { response } = require('express');
require('dotenv').config();
module.exports = () => passport.use(new githubStrategy({
        clientID: "1f6fbd0c8fe0805c2d32",
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/login/github/callback"
    }, async (aceessToken, refreshToken, profile, done) => {
        try{
            console.log('github', profile.username);
            const ex_user = await User.findOne({
              where: {github_name: profile.username}  
            });
            if(ex_user){
                done(null, ex_user);
            }
            else{
                const email = profile._json.email || '';
                const new_user = await User.create({
                    name: profile._json.login,
                    email,
                    password: '',
                    github_name: profile.username,
                    login_as: 'github',
                });
                done(null, new_user);
            }
            res.send('success');
            done(null, ex_user);
        }
        catch(err){
            console.error(err);
            done(err);
        }
    })
);