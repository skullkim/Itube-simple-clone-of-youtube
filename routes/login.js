const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const bcrypt = require('bcrypt');
const path = require('path');

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

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/');
})

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/');
});

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});

router.get('/upload', (req, res, next) => {
    try{
        res.send('hi');
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;