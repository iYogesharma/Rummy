const express = require("express");

const {Auth} = require('../Middlewares/auth.middleware');

const router = express.Router();

const GameControler = require('../Controllers/game.controller');

module.exports = router;

router
    .get('/join/:lobby', Auth, GameControler.joinLobby)
  
    .get('/joincpu/:lobby', GameControler.joinCpuLobby)

    .post('/replay', Auth, GameControler.replay)
  
    .get('/:lobby/:token', GameControler.showGameScreen)

    
