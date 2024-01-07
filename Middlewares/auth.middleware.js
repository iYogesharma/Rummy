const jwt = require('jsonwebtoken');
const {decodeToken} = require('../Helpers/auth.helper');

function Auth( req, res, next ) {
    const {APP_NAME,ACCESS_TOKEN_SECRET} = process.env
    let token  = req.cookies[APP_NAME];
    if( token ) {
        const decoded = decodeToken(token);
        if( decoded ) {
            req.user = decoded;
            next();
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