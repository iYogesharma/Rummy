
exports.registerEventClient = (req,res) => {
    if(!req.sessionID) res.status(401).json({'success':false,'message':'Unauthorizes'});

    const headers = {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    };
    // Write successful response status 200 in the header
    res.writeHead(200, headers);

    global.clients[req.sessionID] = res;

    let counter = 0;
    res.write(`data: ${JSON.stringify({id:counter, date:new Date().toLocaleString(), event:'connected'})}\n`);
    // Send a message on connection;
    counter += 1;

    // Send a subsequent message every five seconds
    setInterval(() => {
        res.write(`data: ${JSON.stringify({id:counter, date:new Date().toLocaleString(), event:'tick'})}\n`);
        counter += 1;
    }, 5000);

    console.log(`${req.sessionID} - Connection opened`);

    req.on('close', () => {
        console.log(`${req.sessionID} - Connection closed`);
        global.clients = Object.keys(global.clients).filter( client => client !== req.sessionID);
    });
}