const express = require('express')
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const Game = require('./game');
const axios = require('axios')
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const rummy = new Game(wss);

require('./passport');



app.get('/alby_callback',
  passport.authenticate('oauth2', { failureRedirect: '/login/alby', session:false }),
  function (req, res) {
      // User has successfully authenticated, redirect
      res.redirect('/')
  });

app.get('/login/alby', 
  passport.authenticate('oauth2', { 
      scope: ['account:read', 'invoices:read','invoices:create','transactions:read','balance:read','payments:send'], 
      successReturnToOrRedirect: '/' 
  })
);

// Serve Static Files/Assets
app.use(express.static('public'));

// Ignore Socket Errors
wss.on('error', () => console.log('*errored*'));
wss.on('close', () => console.log('*disconnected*'));

/*----------------------ENDPOINTS----------------------*/

/*----------------------ENDPOINTS----------------------*/
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/join/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/joincpu/:lobby', (req, res) => {
  let code = req.params.lobby;
  if (rummy.addLobby(code, cpu=true)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/game/:lobby/:token', (req, res) => {
  let code = "" + req.params.lobby,
      token = req.params.token;
  if (req.params.token && rummy.lobbys[code] && rummy.lobbys[code].token == token) {
    res.sendFile(__dirname + '/public/game.html');
  } else {
    res.redirect('/');
  }
});
/*-----------------------------------------------------*/

// Start Server
server.listen(8000, () => {
  console.log('Listening on port 8000...')
});
