const { Server } = require('socket.io');
const cors = require('cors');

const corsHandler = cors({
  origin: "https://magnusinc.webflow.io",
  methods: ["GET", "POST"],
  credentials: true
});

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: "https://magnusinc.webflow.io",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected');
    });
  }

  res.end();
};

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    return corsHandler(req, res, () => {
      res.status(200).end();
    });
  }

  return corsHandler(req, res, () => ioHandler(req, res));
};

export const config = {
  api: {
    bodyParser: false
  }
};