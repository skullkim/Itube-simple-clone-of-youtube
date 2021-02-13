const express = require('express');
const passport = require('passport');
const multer = require('multer');
const {isLoggedIn, 
        isNotLoggedIn,
        uploadProfileImage, 
        uploadVideo,
        uploadSumnail} = require('./middlewares');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('../models/users');
const Token = require('../models/token');
const Video = require('../models/videos');
const axios = require('axios');
const { log } = require('util');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        return res.render('login', {message: req.flash('message')}) 
    }
    catch(err){
        console.error(err);
        next(err);
    }
});
//local login
router.post('/', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirec: '/login',
    }, (auth_error, user, info) => {
        if(auth_error){
            console.error(auth_error);
            return next(auth_error);
        }
        if(!user){
            req.flash('message', info.message);
            return res.redirect('/login');
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

//upload
router.get('/upload', isLoggedIn, (req, res, next) => {
    try{
        res.render('upload', {is_logged_in: true, message: req.flash('message')});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

const video_info = uploadVideo.fields([
    {
        name: 'video',
        maxCount: 1
    },
    {
        name: 'sumnail',
        maxCount: 2
    }
]);

router.post('/upload-video', isLoggedIn, video_info, async (req, res, next) => {
    try{
        //console.log('video', req.files);
        const {video, sumnail} = req.files;
        console.log('video', video[0].path)
        if(video){
            //const {path} = req.file;
            console.log(video);
            const {id} = req.user;
            const {video_name} = req.body;
            console.log(path);
            await Video.create({
                video_user: id,
                video: video[0].path, 
                video_name,
                sumnail: sumnail[0].path,
            });
            req.flash('message', 'Upload success');
            res.redirect('/login/upload');
        }
        else{
            req.flash('message', 'Please choose video before uploading video');
            res.redirect('/login/upload');
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/take-video', isLoggedIn, (req, res, next) => {
    try{
        res.render('record-video', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

//profile
router.get('/profile', isLoggedIn, (req, res, next) => {
    try{
        res.render('profile', {is_logged_in: true, message: req.flash('message')});
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
        res.render('edit-profile', {is_logged_in: true, message: req.flash('message')});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/user-info-adjustment', isLoggedIn, uploadProfileImage.single('profile_img'), async (req, res, next) => {
    try{
        if(req.user.login_as !== 'local'){
            req.flash('message', 'you can only change profile when you login locally')
            res.redirect('/login/profile');
        }
        else{
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
                    //req.flash('message', 'please input valid email address')
                    //res.redirect('/login/profile-adjustment');
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
        res.render('change-password', {is_logged_in: true, message: req.flash('message')});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/passwd-verification', isLoggedIn, async (req, res, next) => {
    try{
        const {curr_passwd, passwd1, passwd2} = req.body;
        const {id, password} = req.user;
       
        if(!await bcrypt.compare(curr_passwd, password)){
            req.flash('message', 'current password is not correct');
            res.redirect('/login/passwd-adjustment');
        }
        else if(passwd1 !== passwd2){
            req.flash('message', 'wrong password');
            res.redirect('/login/passwd-adjustment');
        }
        else{
            const new_passwd = await bcrypt.hash(passwd1, 12);
            await User.update(
                {password: new_passwd},
                {where: {id}},
            );
            req.flash('message', 'change password successful');
            res.redirect('/login/passwd-adjustment');
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/logout', isLoggedIn, async(req, res, next) => {
    const {id, log_profile_img, login_as} = req.user;
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