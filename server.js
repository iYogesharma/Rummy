const {wss,server} = require('./app');

const { connection } = require("./Database/connection");

const { PORT, NODE_ENV } = process.env;

// Ignore Socket Errors
wss.on('error', () => console.log('*errored*'));
wss.on('close', () => console.log('*disconnected*'));


/*-----------------------------------------------------*/

server.listen(PORT || 8000, async (error) => {
  // Logger.info(`Server started connection on port ${PORT || 9081}`);
  if (error) {
    process.exit(1);
  }
  try {
    await connection();
    console.log(
      `server started on port: [${
        PORT || 8000
      }] with [${NODE_ENV.toUpperCase()} --env]`
    );
  } catch (connectionError) {
    console.log(
      "Unable to connect --DATABASE, Killing app :/(",
      connectionError
    );
    process.exit(1);
  }
});

