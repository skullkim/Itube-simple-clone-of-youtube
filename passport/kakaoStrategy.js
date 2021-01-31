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
            // console.log('kakao', profile);
            //console.log(1111111);
            //console.log('kakao', profile._json.properties.profile_image)
            const ex_user = await User.findOne({
                where: {kakao_name: profile.username}
            });
            const path = profile._json.properties.profile_image;
            console.log(path);
            axios.get(path, {
                headers: {Authorization: `Bearer ${accessToken}`}
            })
                .then((response) => {
                    //console.log('res', response);
                    const data = response.data;
                    const bmap = new Buffer(data, 'base64');
                    fs.writeFile('kakao.jpg', bmap, (err) => {
                        if(err) console.error(err);
                        console.log('s');
                    })
                    const st = multer.diskStorage({
                        storage: destination(req, )
                    })
                })
                .catch(err => {
                    console.error(err);
                })
            // fs.readFile(path, (err, data) => {
            //     if(err) console.error(err);
            //     console.log(data);
            // })
            if(ex_user){
                done(null, ex_user);
            }
            else{
                // fs.readFile()
                const email = profile._json.kakao_account.email || '';
                const new_user = await User.create({
                    name: profile.username,
                    email,
                    password: '',
                    kakao_name: profile.username,
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