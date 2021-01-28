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