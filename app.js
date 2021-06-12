const { UV_FS_O_FILEMAP } = require('constants');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

let idList = [];

io.on('connection', socket => {
  socket.on('joined', (id) => {
    idList.push(id);
    io.emit('joined', idList);
  })

  socket.on('sync', (initialDate, initialTime) => {
    socket.broadcast.emit('sync', initialDate, initialTime);
  })

  socket.on('uploaded', (user, fileName) => {
    socket.broadcast.emit('uploaded', user, fileName);
  })

  socket.on('play', (initialTime, initialDate, action) => {
    socket.broadcast.emit('play', initialTime, initialDate, action);
  })

  socket.on('pause', (action) => {
    socket.broadcast.emit('pause', action);
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