const multer = require("multer");
const path = require('path');

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

exports.uploadImage = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, './upload/profile/local');
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
});