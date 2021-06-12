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

setInterval(() => {
  time1 = Date.now();
  socket.emit('ping', time1);
  console.log(video.currentTime);
  console.log(Date.now());
}, 3000)

socket.on('pong', (time2) => {
  console.log(myId + ' PING: ' + (time2 - time1));
})

socket.on('play', (initialTime, initialDate) => {
  const currentDate = Date.now();
  const timeDiff = (currentDate - initialDate) / 1000;
  video.currentTime = initialTime + timeDiff;
  video.play();
});

socket.on('pause', () => {
  video.pause();
});

socket.on('uploaded', (user, fileName) => {
  video.insertAdjacentHTML('beforebegin', `
    <h4>User ${user} uploaded: ${fileName} and invites you to upload the same file.</h4>
  `);

  video.currentTime = 0;
  video.pause();
});

video.addEventListener('seeked', () => {
  // if (firstTime) {
  //   firstTime = false;
  //   return
  // }
  video.pause();
  socket.emit('pause', Date.now());
})

video.addEventListener('play', () => {
  socket.emit('play', video.currentTime, Date.now());
})

video.addEventListener('pause', () => {
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

