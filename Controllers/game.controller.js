
const {wss,server} = require('../app');

const Game = require('../game');

const rummy = new Game(wss);


exports.joinLobby = (req, res) => {
    let code = req.params.lobby;
 
    if (rummy.addLobby(code, false, req.user._id)) {
        res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
    } else {
        res.redirect('/home');
    }
}


exports.joinCpuLobby = (req, res) => {
    let code = req.params.lobby;

    
    if (rummy.addLobby(code, cpu=true, req.user?._id)) {
        res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
    } else {
        res.redirect('/home');
    }
}

exports.showGameScreen = (req, res) => {
    let code = "" + req.params.lobby,
    token = req.params.token;
    if (req.params.token && rummy.lobbys[code] && rummy.lobbys[code].token == token) {
        res.sendFile(global.appRoot + '/public/game.html');
    } else {
        res.redirect('/home');
    }
   
}