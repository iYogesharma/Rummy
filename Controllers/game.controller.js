
const User = require('../Database/Models/user.model');
const { decodeToken } = require('../Helpers/auth.helper');
const {wss} = require('../app');

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

exports.showGameScreen = async (req, res) => {
    let code = "" + req.params.lobby,
    token = req.params.token;
    const lobby = rummy.lobbys[code];

    if( lobby && lobby.cpu == false){
        let token  = req.cookies[process.env.APP_NAME];
        if( token ) {
            const decoded = decodeToken(token);
            if( decoded ) {
                req.user = decoded;

                const user = await  User.findById(decoded._id);

                if( !user || user.balance <= 0 ) {
                    return res.redirect('/home');
                }
            } else {
                return res.redirect('/login');
            }
        }
        else {
            return res.redirect('/login');
        }
    }
    if (req.params.token && lobby && rummy.lobbys[code].token == token) {
        res.sendFile(global.appRoot + '/public/game.html');
    } else {
        res.redirect('/home');
    }
   
}