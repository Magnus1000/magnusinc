const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Placeholder for WebSocket connection
let wsConnection;

app.use(express.json());

// Endpoint for SendGrid webhook
app.post('/sendgrid/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    // Assuming the body contains the event data
    const eventData = req.body;

    // Send the event data to the front-end if the WebSocket connection exists
    if (wsConnection) {
        wsConnection.send(JSON.stringify(eventData));
    }

    res.status(200).send('Event received');
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    wsConnection = ws;

    ws.on('close', () => {
        console.log('Client disconnected');
        wsConnection = null;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})  




 