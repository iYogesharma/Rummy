/*
 * Socket Related Functions
 */

let socket = new WebSocket(window.location.href.replace('http', 'ws')); // Connect to socket @ same url as page

let handle = {}; // Store Handlers

socket.onopen = (event) => {

  console.log("Connected.");

  window.addEventListener('beforeunload', () => { // Attempts to Close Socket before forced disconnect
    socket.close();
  });

};

socket.onmessage = (message) => {

  let data = JSON.parse(message.data);
  console.log(data);
  if (data.cmd in handle) { // Choose and Execute Appropriate Handler
    handle[data.cmd](data);
  }

}

let waitForConnection = function (callback, interval) {
  if (socket.readyState === 1) {
      callback();
  } else {
      var that = this;
      // optional: implement backoff for interval here
      setTimeout(function () {
          waitForConnection(callback, interval);
      }, interval);
  }
};
let send = (data) => { // Send Data (as string)
  waitForConnection( function() {
    socket.send(JSON.stringify(data));
  },1000)
 
}
