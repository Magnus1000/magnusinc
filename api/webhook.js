const { Server } = require('socket.io');
const cors = require('cors');

const corsHandler = cors();

module.exports = async (req, res) => {
  try {
    console.log('Inside the serverless function...');
    console.log('Request body:', req.body);

    corsHandler(req, res, async () => {
      if (req.method === 'POST') {
        const io = new Server(res.socket.server);

        // Broadcast the new event to all connected clients
        io.emit('newEvent', req.body);

        res.status(200).end('Event received');
      } else {
        res.status(405).end('Method Not Allowed');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};