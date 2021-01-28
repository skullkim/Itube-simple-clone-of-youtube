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
            return res.render('index', {is_logged_in: true});
            //res.redirect('/');
        });
    })(req, res, next);
});

router.get('/mainpage', isLoggedIn, (req, res, next) => {
    try{
        res.render('index', {is_logged_in: true});
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.post('/upload', (req, res, next) => {
    try{
        res.send('hi');
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;