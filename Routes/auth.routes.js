const express = require("express");

const passport = require('passport')

const AuthController = require('../Controllers/auth.controller');
const AlbyController = require('../Controllers/alby.controller');

const {Auth,RedirectIfAuthenticated} = require('../Middlewares/auth.middleware');

const router = express.Router();



router
    .get('/login/alby', 
        passport.authenticate('oauth2', { 
            scope: ['account:read', 'invoices:read','invoices:create','transactions:read','balance:read','payments:send'], 
            successReturnToOrRedirect: '/home' 
        })
    )
    
    .get(
        '/alby_callback',
        passport.authenticate('oauth2', { failureRedirect: '/login/alby', session:false }),
        AuthController.handleCallback
    )

    .get('/login', RedirectIfAuthenticated, (req, res) => {
        res.sendFile(global.appRoot + '/public/login.html');
    })

    .get('/home', Auth, (req, res) => {
        res.sendFile(global.appRoot + '/public/home.html');
    })

    .get('/v1/balance', Auth, AlbyController.accountBalance)


module.exports = router;