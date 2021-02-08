const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/users');

const router = express.Router();
router.get('/', (req, res, next) => {
    try{
        res.render('signup', {message: req.flash('message')});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/check', async (req, res, next) => {
    try{
        const {name, email, passwd1, passwd2} = req.body;
        const ex_user = await User.findOne({
            where: {email}
        })
        if(ex_user){
            req.flash('message', 'you already signed up');
            res.redirect('/signup');
        }
        else if(!email.includes('@')){
            req.flash('message', 'input proper email address');
            res.redirect('/signup');
        }
        else if(passwd1 !== passwd2){
            req.flash('message', 'wrong password');
            res.redirect('/signup');
        }
        else{
            const password = await bcrypt.hash(passwd1, 12);
            await User.create({
                name,
                email,
                password,
                login_as: 'local',
            });
            res.redirect('/');
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;