const express = require('express')
const passport = require('passport')
const http = require('http');
const WebSocket = require('ws');
const app = express();
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
const helmet = require('helmet');
require("dotenv").config();


const server = http.createServer(app);
 
const wss = new WebSocket.Server({ server });

const { COOKIE_ENCRYPT_SECRET} = process.env

require('./passport');

app.use(cookieParser(COOKIE_ENCRYPT_SECRET));
app.use(cookieEncrypter(COOKIE_ENCRYPT_SECRET));
app.use(helmet())

global.appRoot = __dirname;

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