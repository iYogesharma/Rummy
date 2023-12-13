const authRouter = require("./auth.routes");

const gameRouter = require("./game.routes");

const {app} = require("../app");

function appRouter() {

    app.use('/game', gameRouter)

    app.use('/', authRouter)
}

module.exports = appRouter;