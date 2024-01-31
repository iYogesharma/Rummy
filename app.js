const express = require('express')
const passport = require('passport')
const http = require('http');
const WebSocket = require('ws');
const app = express();
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
const helmet = require('helmet');
const session = require('express-session');
require("dotenv").config();

const bodyParser = require('body-parser');


const server = http.createServer(app);
 
const wss = new WebSocket.Server({ server });

const { COOKIE_ENCRYPT_SECRET} = process.env

require('./passport');

app.use(session({
	secret: '12345',
	resave: false,
	saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(cookieParser(COOKIE_ENCRYPT_SECRET));
app.use(cookieEncrypter(COOKIE_ENCRYPT_SECRET));
app.use(helmet())
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('lnurl-auth'));

global.appRoot = __dirname;
global.clients = {}

// Serve Static Files/Assets
app.use(express.static('public'));

module.exports = {
  app,
  wss,
  server
};


require("./Routes")();

app.get('/', (req, res) => {
  res.redirect('/home');
});