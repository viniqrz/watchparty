const { UV_FS_O_FILEMAP } = require('constants');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('public'));

let timeObject = {};
let idList = [];

io.on('connection', (socket) => {
  console.log('connected');
  io.to(socket.id).emit('connected', socket.id);

  socket.on('joined', (id) => {
    idList.push(id);
    io.emit('joined', idList);
  });

  socket.on('timeupdate', (currentTime) => {
    timeObject[socket.id] = currentTime;
    console.log(timeObject);

    let timeArr = [];
    let idArr = [];

    for (const id in timeObject) {
      timeArr.push(timeObject[id]);
      idArr.push(id);
    }

    const maxTime = Math.max(...timeArr);

    console.log(maxTime);

    timeArr.forEach((el, index) => {
      if (el === maxTime) return;

      const timeDiff = maxTime - el;

      if (timeDiff < 5) return;

      io.to(idArr[index]).emit('sync', maxTime - el);
    });
  });

  socket.on('sync', (initialDate, initialTime) => {
    socket.broadcast.emit('sync', initialDate, initialTime);
  });

  socket.on('uploaded', (user, fileName) => {
    socket.broadcast.emit('uploaded', user, fileName);
  });

  socket.on('play', (initialTime, initialDate, action) => {
    socket.broadcast.emit('play', initialTime, initialDate, action);
  });

  socket.on('pause', (action) => {
    socket.broadcast.emit('pause', action);
  });

  socket.on('disconnect', () => {
    delete timeObject[socket.id];
    console.log('disconnect');
  });

  socket.on('user', (user) => {
    console.log(user);
    console.log('A user connected');
    socket.broadcast.emit('chat message', `<i>${user.nickname} joined.</i>`);

    socket.on('disconnect', () => {
      console.log('user disconnected');
      socket.broadcast.emit('chat message', `<i>${user.nickname} left.</i>`);
    });

    socket.on('chat message', (msg) => {
      console.log(`message: ${msg}`);
      socket.broadcast.emit('chat message', `<b>${user.nickname}:</b> ${msg}`);
    });
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('listening on PORT 3000...');
});
