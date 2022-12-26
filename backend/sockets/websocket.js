const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

function start() {
logger.info('WebSocket server listening on port 8080');
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        logger.info(`Received message: ${message}`);
      ws.send(`Echo: ${message}`);
    });
    ws.send('Welcome to the WebSocket server!');
  });
}

module.exports = {
  start,
};