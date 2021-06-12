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
// let centralSyncTime = 0;
let timeObject = {};

io.on('connection', socket => {
  io.to(socket.id).emit('connected', socket.id);

  socket.on('joined', (id) => {
    idList.push(id);
    io.emit('joined', idList);
  })

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

      io.to(idArr[index]).emit('sync', (maxTime - el));
    });
  })

  socket.on('sync', (initialDate, initialTime) => {
    socket.broadcast.emit('sync', initialDate, initialTime);
  })

  socket.on('uploaded', (user, fileName) => {
    socket.broadcast.emit('uploaded', user, fileName);
  })

  socket.on('play', (initialTime, initialDate, action) => {
    // if (syncTime === null) centralSyncTime = 0;
    socket.broadcast.emit('play', initialTime, initialDate, action);
  })

  socket.on('pause', (action) => {
    socket.broadcast.emit('pause', action);
  })

  socket.on('ping', (time1) => {
    const time2 = Date.now();
    io.to(socket.id).emit('pong', time2);
  })

  socket.on('disconnect', () => {
    delete timeObject[socket.id];
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