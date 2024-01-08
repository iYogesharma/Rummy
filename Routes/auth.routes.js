const express = require("express");

const passport = require('passport')

const AuthController = require('../Controllers/auth.controller');
const AlbyController = require('../Controllers/alby.controller');

const {Auth,RedirectIfAuthenticated} = require('../Middlewares/auth.middleware');
const { LnAuth } = require("../passport");

const router = express.Router();



router
    .get('/login/lightning', function(req, res, next) {
        const {user} = req;
        const {APP_NAME} = process.env;
        if( user ) {
            const currentTime = new Date().getTime();
            const expires = new Date(currentTime + 30 * 24 * 60 * 60 * 1000);
            res.cookie(APP_NAME, JSON.stringify({ access_token : user._token }), {
                secure: true,
                httpOnly: true,
                expires: expires,
            });
            return res.redirect('/home')
        } else {
            next();
        }
	}, LnAuth )

    // .get('/login/alby', 
    
    //     passport.authenticate('oauth2', { 
    //         scope: ['account:read', 'invoices:read','invoices:create','transactions:read','balance:read','payments:send'], 
    //         successReturnToOrRedirect: '/home' 
    //     })
    // )
    
    .get(
        '/alby_callback',
        passport.authenticate('oauth2', { failureRedirect: '/login/alby', session:false }),
        AuthController.handleCallback
    ) 

    .get('/login/', RedirectIfAuthenticated, (req, res) => {
        res.sendFile(global.appRoot + '/public/login.html');
    })

    .get('/home', Auth, (req, res) => {
        res.sendFile(global.appRoot + '/public/home.html');
    })

    .get('/v1/balance', Auth, AlbyController.accountBalance)


module.exports = router;