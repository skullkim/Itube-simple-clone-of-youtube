const express = require('express');
const path = require('path');
const Video = require('../models/videos');

const router = express.Router();

router.get('/uploaded-video', async(req, res, next) => {
    try{
        const videos = await Video.findAll({});
        console.log(videos);
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;