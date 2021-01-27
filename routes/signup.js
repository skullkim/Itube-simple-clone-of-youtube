const express = require('express');
const path = require('path');
const User = require('../models/users');

const router = express.Router();
router.get('/', (req, res, next) => {
    try{
        res.render('signup');
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/check', async (req, res, next) => {
    try{
        const {name, email, passwd1, passwd2} = req.body;
        console.log(name, email, passwd1, passwd2);
        const ex_user = await User.findOne({
            where: {name}
        })
        if(ex_user){
            res.redirect('/signup?error=you already signed up');
        }
        else if(!email.includes('@')){
            res.redirect('/signup?error=input proper email address');
        }
        else if(passwd1 !== passwd2){
            res.redirect('/signup?error=wrong password');
        }
        else{
            await User.create({
                name,
                email,
                password: passwd1,
            });
            res.redirect('/');
        }
        //res.send('hi');
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;