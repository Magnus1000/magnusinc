// api/webhook.js
const WebSocket = require('ws');

// Create WebSocket server
const server = require('http').createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients
let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Client connected, total clients:', clients.length);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected, remaining clients:', clients.length);
  });
});

// Handle incoming webhook requests
module.exports = (req, res) => {
  console.log('Received request on:', req.url, 'with method:', req.method);

  if (req.method === 'POST') {
    const newEvent = req.body;
    console.log('Broadcasting event:', newEvent);

    // Broadcast the new event to all connected clients
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newEvent));
        console.log('Event sent to a client');
      }
    });

    console.log('Event broadcasted to all clients');
    res.status(200).send('Event broadcasted');
  } else {
    console.log('Request method not allowed:', req.method);
    res.status(405).send('Method Not Allowed');
  }
};

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server started on port ${PORT}`);
});