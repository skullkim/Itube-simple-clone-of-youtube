const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        console.log(1); 
        if(req.isAuthenticated()){
            res.render('index', {is_logged_in: true});
        }
        else{
            res.render('index', {is_logged_in: false});
        }
        //res.render('index', {is_logged_in: false});
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;