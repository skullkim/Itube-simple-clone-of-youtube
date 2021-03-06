const multer = require("multer");
const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

exports.isLoggedIn = (req, res, next) => {
     req.isAuthenticated() ? next() : res.redirect('/?error= you have to login first');
}

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        next();
    }
    else{
        const message = encodeURIComponent('you already logged in');
        res.redirect(`/?error=${message}`);
    }
}

exports.AwsConfig = AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'ap-northeast-2',
});

exports.uploadProfileImage = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: `${process.env.AWS_S3_BUCKET}`,
        key(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, `upload/profile/local/${path.basename(file.originalname, ext) + Date.now() + ext}`);
        },
    }),
});

exports.uploadVideo = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: `${process.env.AWS_S3_BUCKET}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, file, cb){
            cb(null, {fieldName: file.fieldname});
        },
        key(req, file, done){
            const ext = path.extname(file.originalname);
            console.log(file);
            const s3_path = file.fieldname === 'video' ?
                `upload/video/${path.basename(file.originalname, ext) + Date.now() + ext}` :
                `upload/sumnail/${path.basename(file.originalname, ext) + Date.now() + ext}`;
            done(null, s3_path);
        }
    }),

});

// exports.uploadProfileImage = multer({
//     storage: multer.diskStorage({
//         destination(req, file, done){
//             done(null, './upload/profile/local');
//         },
//         filename(req, file, done){
//             const ext = path.extname(file.originalname);
//             done(null, path.basename(file.originalname, ext) + Date.now() + ext);
//         },
//     }),
// });

// exports.uploadVideo = multer({
//     storage: multer.diskStorage({
//         destination(req, file, done){
//             if(file.fieldname === 'video'){
//                 done(null, './upload/video');
//             }
//             else if(file.fieldname === 'sumnail'){
//                 done(null, './upload/sumnail');
//             }
//         },
//         filename(req, file, done){
//             const ext = path.extname(file.originalname);
//             done(null, path.basename(file.originalname, ext) + Date.now() + ext);
//         },
//     }), 
// });

// exports.uploadSumnail = multer({
//     storage: multer.diskStorage({
//         destination(req, file, done){
//             done(null, './upload/sumnail');
//         },
//         filename(req, file, done){
//             const ext = path.extname(file.originalname);
//             done(null, path.basename(file.originalname, ext) + Date.now() + ext);
//         }
//     }),
// });