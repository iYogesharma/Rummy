const authRouter = require("./auth.routes");

const gameRouter = require("./game.routes");

const paymentRouter = require("./payment.routes");

const EventsControler = require('../Controllers/events.controller');

const {app} = require("../app");

function appRouter() {

    app.use('/events', EventsControler.registerEventClient);
    
    app.use('/game', gameRouter);

    app.use('/', authRouter);

    app.use('/', paymentRouter);

}

module.exports = appRouter;