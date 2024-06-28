const cors = require('cors');
const { Server } = require('socket.io');

const handler = (req, res) => {
  if (req.method === 'POST') {
    const io = new Server(res.socket.server);
    
    // Broadcast the new event to all connected clients
    io.emit('newEvent', req.body);
    
    res.status(200).end('Event received');
  } else {
    res.status(405).end('Method Not Allowed');
  }
};

export const config = {
  api: {
    bodyParser: true,
  },
};

export default cors({
  origin: 'https://magnusinc.webflow.io',
  methods: ['POST', 'GET', 'OPTIONS'],
})(handler);