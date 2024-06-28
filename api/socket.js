const { Server } = require('socket.io');
const cors = require('cors');

const corsHandler = cors();

module.exports = async (req, res) => {
  corsHandler(req, res, async () => {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
        cors: {
            origin: "*", // Allow all origins
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: false // Correctly set to false since 'origin' is '*'
        }
        });

      res.socket.server.io = io;

      io.on('connection', (socket) => {
        console.log('Client connected');
      });
    }
    res.end();
  });
};

export const config = {
  api: {
    bodyParser: false
  }
};