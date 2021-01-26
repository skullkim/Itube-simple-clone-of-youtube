const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/header', (req, res, next) => {
    try{
        fs.readFile('views/header.html', 'utf-8', (err, data) => {
            if(err){
                throw err;
            }
            const response = {
                data
            };
            res.json(response);
        });
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/footer', (req, res, next) => {
    try{
        fs.readFile('views/footer.html', 'utf-8', (err, data) => {
            if(err){
                throw err;
            }
            const response = {
                data
            };
            res.json(response);
        })
    }
    catch(err){
        console.err(err);
        next(err);
    }
});

module.exports = router;