const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static('public'));

app.get('/api/status-codes', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'status-code.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(err.status).end();
    }
  });
});

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    io.emit('message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`listening...`);
});
