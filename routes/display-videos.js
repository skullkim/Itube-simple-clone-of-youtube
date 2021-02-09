const express = require('express');
const path = require('path');
const Video = require('../models/videos');
const User = require('../models/users');

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
        //console.log(req.query.id);
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
});

router.get('/single-video-page', (req, res, next) => {
    try{
        if(req.isAuthenticated()){
            res.render('video', {is_logged_in: true});
        }
        else{
            res.render('video', {is_logged_in: false});
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/info', async (req, res, next) => {
    try{
        const id =  req.query.id;
        //console.log('id', id);
        const video = await Video.findOne({
            where: {id},
        });
        const {video_user, video_name} = video;
        const user = await User.findOne({
            where: {id: video_user}
        });
        const {name} = user;
        const response = {
            video_name,
            name,
        };
        res.send(JSON.stringify(response));
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/single-video', async (req, res, next) => {
    try{
        const id = req.query.id;
        //console.log(id);
        const video = await Video.findOne({
            where: {id},
        });
        //console.log(video);
        res.sendFile(path.join(__dirname, `../${video.video}`))
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;