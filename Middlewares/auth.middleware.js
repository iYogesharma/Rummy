const jwt = require('jsonwebtoken');


function Auth( req, res, next ) {
    const {APP_NAME,ACCESS_TOKEN_SECRET} = process.env
    let token  = req.cookies[APP_NAME];
    if( token ) {
        token = JSON.parse(token);
        const {access_token} = token;
    
        if( access_token ) {
            try {
                const decoded = jwt.verify(access_token, ACCESS_TOKEN_SECRET);
                if( decoded._id ) {
                    req.user = decoded;
                    next();
                } else {
                    return res.redirect('/login');
                }
            } catch (err) {
                return res.redirect('/login');
            }
        } else {
            return res.redirect('/login');
        }
    }
    else {
        return res.redirect('/login');
    }
}

function RedirectIfAuthenticated( req, res, next ) {

    const {APP_NAME} = process.env
    
    let token  = req.cookies[APP_NAME];

    if( token ) {
        return res.redirect('/home');
    } else {
        next()
    }
}


module.exports = {Auth,RedirectIfAuthenticated}