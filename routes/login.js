const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

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
            //return res.redirect('/login/mainpage');
            //return res.render('index', {is_logged_in: true});
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
        console.log(req.user.log_profile_img);
        if(req.user.log_profile_img === null){
            res.sendFile(path.join(__dirname, '../public/default-profile.png'));
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/profile-name', isLoggedIn, (req, res, next) => {
    try{
        const name = req.user.name;
        const response = {
            name,
        };
        res.send(JSON.stringify(response));
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/edit-profile', isLoggedIn, (req, res, next) => {
    try{
        res.render('edit-profile', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});



module.exports = router;