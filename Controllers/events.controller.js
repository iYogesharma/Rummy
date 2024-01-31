
exports.registerEventClient = (req,res) => {
    if(!req.sessionID) res.status(401).json({'success':false,'message':'Unauthorizes'});

    const headers = {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    // Write successful response status 200 in the header
    res.writeHead(200, headers);

    res.write(`data: ${JSON.stringify({num: 1})}\n\n`);

    global.clients[req.sessionID] = res;

    console.log(`${req.sessionID} - Connection opened`);

    req.on('close', () => {
        console.log(`${req.sessionID} - Connection closed`);
        global.clients = Object.keys(global.clients).filter( client => client !== req.sessionID);
    });
}