const express = require('express');
const path = require('path');
const Video = require('../models/videos');

const router = express.Router();

router.get('/uploaded-video', async(req, res, next) => {
    try{
        const videos = await Video.findAll({});
        res.send(JSON.stringify(videos));
        //res.sendFile(path.join(__dirname, JSON.stringify(videos)));
        //console.log(videos);
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/sumnail', async(req, res, next) => {
    try{
        const id = req.query.id;
        console.log(req.query.id);
        const video = await Video.findOne({
            where: {id}
        })
        const {sumnail} = video;
        res.sendFile(path.join(__dirname, `../${sumnail}`));
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;