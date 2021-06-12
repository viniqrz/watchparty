const { UV_FS_O_FILEMAP } = require('constants');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('connect');

  socket.on('uploaded', (user, fileName) => {
    socket.broadcast.emit('uploaded', user, fileName);
  })

  socket.on('play', (initialTime, initialDate, id, sourceId) => {
    socket.broadcast.emit('play', initialTime, initialDate, id, sourceId);
  })

  socket.on('pause', (initialDate) => {
    socket.broadcast.emit('pause', '');
  })

  socket.on('ping', (time1) => {
    const time2 = Date.now();
    io.to(socket.id).emit('pong', time2);
  })

  socket.on('disconnect', (socket) => {
    console.log('disconnect');
  });
})

// app.get('/', (req, res, next) => {
//   res.send('');
// })

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('listening on PORT 3000...');
});