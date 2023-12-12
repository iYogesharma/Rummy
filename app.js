const express = require('express')
const passport = require('passport')
const http = require('http');
const WebSocket = require('ws');
const Game = require('./game');
const app = express();
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
require("dotenv").config();

const {Auth,RedirectIfAuthenticated} = require('./Middlewares/auth.middleware');

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const rummy = new Game(wss);

const {APP_NAME, COOKIE_ENCRYPT_SECRET} = process.env

require('./passport');

app.use(cookieParser(COOKIE_ENCRYPT_SECRET));
app.use(cookieEncrypter(COOKIE_ENCRYPT_SECRET));

//? routes
// require("./Routes")();

app.get('/', (req, res) => {
  res.redirect('/home');
});


app.get('/alby_callback',
  passport.authenticate('oauth2', { failureRedirect: '/login/alby', session:false }),
  function (req, res) {
      const {user} = req;
      if( user ) {
        const currentTime = new Date().getTime();
        const expires = new Date(currentTime + 30 * 24 * 60 * 60 * 1000);
        res.cookie(APP_NAME, JSON.stringify({ access_token : user._token }), {
          secure: true,
          httpOnly: true,
          expires: expires,
        });
        res.redirect('/home')
      } else {
        res.redirect('/login/alby')
      }
     
  });

app.get('/login/alby', 
  passport.authenticate('oauth2', { 
      scope: ['account:read', 'invoices:read','invoices:create','transactions:read','balance:read','payments:send'], 
      successReturnToOrRedirect: '/home' 
  })
);

// Serve Static Files/Assets
app.use(express.static('public'));


/*----------------------ENDPOINTS----------------------*/

/*----------------------ENDPOINTS----------------------*/
app.get('/login', RedirectIfAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/test', Auth,
 (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/home', Auth,
 (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/join/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/home');
  }
});

app.get('/joincpu/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code, cpu=true)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/home');
  }
});

app.get('/game/:lobby/:token', (req, res) => {
  let code = "" + req.params.lobby,
      token = req.params.token;
  if (req.params.token && rummy.lobbys[code] && rummy.lobbys[code].token == token) {
    res.sendFile(__dirname + '/public/game.html');
  } else {
    res.redirect('/home');
  }
});
/*-----------------------------------------------------*/

module.exports = {
  app,
  wss,
  server
};
