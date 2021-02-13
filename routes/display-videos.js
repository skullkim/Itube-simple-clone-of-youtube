const express = require('express');
const path = require('path');
const Video = require('../models/videos');
const User = require('../models/users');
const Comment = require('../models/cooments');

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
            res.render('video', {is_logged_in: false, message: req.flash('message')});
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
        const videos = await Comment.count({
            where: {commenter: id}
        });
        const {video_user, video_name} = video;
        const user = await User.findOne({
            where: {id: video_user}
        });
        const {name} = user;
        const response = {
            video_name,
            name,
            videos,
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

router.get('/comment', async (req, res, next) => {
    try{
        // const {video_id} = req.body;
        const commenter = req.query.commenter;
        console.log(commenter)
        const comments = await Comment.findAll({
            where: {commenter},
        });
        //console.log(comments);
        res.send(JSON.stringify(comments));
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

router.put('/new-comment', async (req, res, next) => {
    try{
        //console.log(req.body);
        if(req.isAuthenticated()){
            const {comment, video_id} = req.body;
            await Comment.create({
                commenter: video_id,
                comment,
            });
            res.end();
        }
        else{
            const err = {
                error: 'you have to login before adding comment',
            }
            res.send(JSON.stringify(err));
            // req.flash('message', 'you have to login before adding comment');
            // res.redirect('/video/single-video-page');
            // //res.render('video', {is_logged_in: false, message: req.flash('message')});
        }
    }
    catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;