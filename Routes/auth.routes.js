const express = require("express");

const passport = require('passport')

const AuthController = require('../Controllers/auth.controller');

const EventsControler = require('../Controllers/events.controller');
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

    .get('/events',Auth, EventsControler.registerEventClient)

module.exports = router;