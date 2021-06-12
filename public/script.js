const uploadCc = document.querySelector(".upload-cc");
const btnUploadVideo = document.querySelector('form button');
const inputVideo = document.querySelector('.input-video');
const video = document.querySelector('video');
const videoForm = document.getElementById('video-form');
const source1 = document.getElementById('source-video');

const myId = Math.random().toString().slice(16);

let socket = io();

let time1;
let firstTime = true;
let sourceId = null;
let myUserList = [];
let receivedAction = null;
let justSynced = false;

setInterval(() => {
  time1 = Date.now();
  socket.emit('ping', time1);
  console.log(video.currentTime);
  console.log(Date.now());
}, 3000)


socket.emit('joined', myId);

socket.on('joined', userList => {
  userList = [];
});

socket.on('pong', (time2) => {
  console.log(myId + ' PING: ' + (time2 - time1));
})

socket.on('play', (initialTime, initialDate, action) => {
  receivedAction = action;

  if (action.user === myId) return;

  video.play();

});

socket.on('pause', () => {
  video.pause();
  receivedAction = null;
});

socket.on('uploaded', (user, fileName) => {
  video.insertAdjacentHTML('beforebegin', `
    <h4>User ${user} uploaded: ${fileName} and invites you to upload the same file.</h4>
  `);

  video.currentTime = 0;

  video.pause();
});

socket.on('sync', (initialDate, initialTime) => {
  const currentDate = Date.now();
  const timeDiff = currentDate - initialDate;
  video.currentTime = initialTime;

  justSynced = true;
  setInterval(() => {
    justSynced = false;
  }, 2500);
});

let timer;

video.addEventListener('seeking', () => {
  if (!justSynced) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      console.log('aaaaaaaaaaaaaaaaaaaa');
      socket.emit('sync', Date.now(), video.currentTime);
    }, 600);
  }

  justSynced = true;
  setInterval(() => {
    justSynced = false;
  }, 2500);
})

document.body.addEventListener('mouseup', () => {
  // if (seeked) {
  //   seeked = false;
  //   alert(1);
  // }
})

video.addEventListener('play', () => {
  const action = receivedAction || {
    id: Math.random().toString().slice(16),
    user: myId,
    date: Date.now()
  };

  socket.emit('play', video.currentTime, Date.now(), action);
  receivedAction = null;
})

video.addEventListener('pause', () => {
  receivedAction = null;
  socket.emit('pause', Date.now());
})

btnUploadVideo.addEventListener('click', (e) => {
  e.preventDefault();

  if (!inputVideo.files[0]) return;

  const videoUrl = window.URL.createObjectURL(inputVideo.files[0]);

  source1.src = videoUrl;
  video.insertAdjacentHTML('beforebegin', `
    <h4>You uploaded: ${inputVideo.files[0].name}</h4>
  `);

  socket.emit('uploaded', myId, inputVideo.files[0].name);

  video.load();
});

