const express = require('express');
const passport = require('passport');
const multer = require('multer');
const {isLoggedIn, isNotLoggedIn, uploadImage} = require('./middlewares');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('../models/users');
const Token = require('../models/token');
const axios = require('axios');
const { log } = require('util');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        res.render('login');
    }
    catch(err){
        console.error(err);
        next(err);
    }
});
//local login
router.post('/', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (auth_error, user, info) => {
        if(auth_error){
            console.error(auth_error);
            return next(auth_error);
        }
        if(!user){
            console.log(info.message);
            return res.redirect(`/?error=${info.message}`);
        }
        return req.login(user, (login_error) => {
            if(login_error){
                console.error(login_error);
                return next(login_error);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

//github login
router.get('/github', isNotLoggedIn, passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/');
})

//kakao login
router.get('/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/');
});

router.get('/upload', isLoggedIn, (req, res, next) => {
    try{
        res.send('hi');
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

//profile
router.get('/profile', isLoggedIn, (req, res, next) => {
    try{
        res.render('profile', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/profile-img', isLoggedIn, (req, res, next) => {
    try{
        const user = req.user;
        if(user.login_as === 'local' && user.log_profile_img === null){
            res.sendFile(path.join(__dirname, '../public/default-profile.png'));
        }
        else{
            res.sendFile(path.join(__dirname, `../${user.log_profile_img}`));
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/profile-name', isLoggedIn, (req, res, next) => {
    try{
        const user = req.user;
        const response = {name: null};
        if(user.login_as === 'local'){
            response.name = user.name;
        }
        else if(user.login_as === 'kakao'){
            response.name = user.kakao_name
        }
        else if(user.login_as === 'github'){
            response.name = user.github_name
        }
        res.send(JSON.stringify(response));
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/profile-adjustment', isLoggedIn, (req, res, next) => {
    try{
        res.render('edit-profile', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/user-info-adjustment', isLoggedIn, uploadImage.single('profile_img'), async (req, res, next) => {
    try{
        if(req.user.login_as !== 'local'){
            res.redirect('/login/profile?error=you can only change profile when you login locally');
        }
        else{
            //console.log(req.body);
            const {name, email} = req.body;
            console.log(name, email);
            const {id, log_profile_img} = req.user;
            if(req.file){
                const {path} = req.file;
                console.log(path, '   id', id);
                await User.update(
                    {log_profile_img: `/${path}`},
                    {where: {id}}
                )
                fs.unlink(`.${log_profile_img}`, (err) => {
                    if(err){
                        console.error(err);
                        next(err);
                    }
                    console.log('local profile image deleted');
                })
            }
            if(name){
                await User.update(
                    {name},
                    {where: {id}}
                )
            }
            if(email){
                if(!email.includes('@')){
                    res.redirect('/login/profile-adjustment?error=please input valid email address');
                }
                await User.update(
                    {email},
                    {where: {id}}
                )
            }
            res.redirect('/login/profile');
        }
        console.log('user', req.user);
        console.log('file', req.file);
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/passwd-adjustment', isLoggedIn, (req, res, next) => {
    try{
        res.render('change-password', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});



router.get('/logout', isLoggedIn, async(req, res, next) => {
    //console.log(req.user);
    const {id, log_profile_img, login_as} = req.user;
    //console.log(id, log_profile_img, login_as);
    if(login_as === 'kakao' || login_as === 'github'){
        await fs.unlink(`.${log_profile_img}`, (err) => {
            if(err){
                console.error(err);
                next(err);
            }
            console.log('deleted');
        })
    }
    const token = await Token.findOne({
        where: {user_id: id}
    });
    
    if(login_as === 'kakao'){
        //console.log('kakao auth', token.kakao_auth);
        axios({
            method: 'post',
            url: 'https://kapi.kakao.com/v1/user/logout',
            headers: {
                Host: 'kapi.kakao.com',
                Authorization: `Bearer ${token.kakao_auth}`,
            }
        })
            .then(response => {
                console.log(`kakao logout success ${response}`)
            })
            .catch(err => {
                console.error(err);
                next(err);
            })
    }
    await Token.destroy({
        where: {user_id: id}
    });
    req.logOut();
    req.session.destroy();
    res.redirect('/');

});



module.exports = router;