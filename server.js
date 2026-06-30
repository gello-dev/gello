const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const players = {};

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name || 'Anónimo',
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 200,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };
    io.emit('players', players);
  });

  socket.on('move', (pos) => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].y = pos.y;
      io.emit('players', players);
    }
  });

  socket.on('chat', (msg) => {
    if (players[socket.id]) {
      io.emit('chat', { name: players[socket.id].name, msg: msg, id: socket.id });
    }
  });

  socket.on('color', (color) => {
    if (players[socket.id]) {
      players[socket.id].color = color;
      io.emit('players', players);
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('players', players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Gello a correr na porta ' + PORT);
});
