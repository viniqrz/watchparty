const btnUploadVideo = document.querySelector('.submit');
const inputVideo = document.querySelector('.input-video');
const video = document.querySelector('#my-video');
const source1 = document.getElementById('source-video');
const btnPlay = document.querySelector('.my-btn-play');
const btnPause = document.querySelector('.my-btn-pause');
const inputVolume = document.querySelector('.input-volume');
const progressBar = document.querySelector('.progress-bar');
const fillProgressBar = document.querySelector('.progress-bar-fill');
const draggable = document.querySelector('.draggable');
const controlIcon = document.querySelector('.my-btn-play i');

let myId;
let myIdList;

let socket = io();

let receivedAction = null;
let localSocketId;

socket.on('connected', (socketId) => {
  myId = socketId;
  socket.emit('joined', myId);
});

socket.on('joined', (userList) => {
  myIdList = userList;
});

video.addEventListener('timeupdate', () => {
  const progress = video.currentTime / video.duration;
  const fillWidth = progress * progressBar.offsetWidth;
  fillProgressBar.style.width = fillWidth + 'px';
});

const controlPlay = () => {
  video.play();
  controlIcon.className = 'fas fa-pause';

  const action = receivedAction || {
    id: Math.random().toString().slice(16),
    user: myId,
    date: Date.now(),
  };

  socket.emit('play', video.currentTime, Date.now(), action);
  receivedAction = null;
};

const controlPause = () => {
  video.pause();
  controlIcon.className = 'fas fa-play';

  receivedAction = null;

  socket.emit('pause', Date.now());
};

const controlMedia = () => {
  if (video.paused) {
    controlPlay();
    return;
  }

  controlPause();
};

btnPlay.addEventListener('click', controlMedia);

inputVolume.addEventListener('change', (e) => {
  video.volume = inputVolume.value;
});

const barX0 = progressBar.getBoundingClientRect().left;
const barX1 =
  progressBar.getBoundingClientRect().left + progressBar.offsetWidth;

progressBar.addEventListener('click', (e) => {
  if (e.clientX > barX0 && e.clientX < barX1) {
    const absProgress = e.clientX - barX0;
    const relativeProgress = absProgress / progressBar.offsetWidth;
    video.currentTime = relativeProgress * video.duration;

    const action = receivedAction || {
      id: Math.random().toString().slice(16),
      user: myId,
      date: Date.now(),
    };

    socket.emit('play', video.currentTime, Date.now(), action);
    receivedAction = null;

    video.play();
  }
});

socket.on('pong', (time2) => {
  console.log(myId + ' PING: ' + (time2 - time1));
});

socket.on('play', (initialTime, initialDate, action) => {
  receivedAction = action;

  if (action.user === myId) return;

  const currentDate = Date.now();
  const timeDiff = (currentDate - initialDate) / 1000;
  video.currentTime = initialTime + timeDiff;

  video.play();
  controlIcon.className = 'fas fa-pause';
});

socket.on('pause', () => {
  video.pause();
  controlIcon.className = 'fas fa-play';
  receivedAction = null;
});

socket.on('uploaded', (user, fileName) => {
  video.insertAdjacentHTML(
    'beforebegin',
    `
    <h4>User ${user} uploaded: ${fileName} and invites you to upload the same file.</h4>
  `
  );

  video.currentTime = 0;
  video.pause();
});

video.addEventListener('seeked', () => {
  receivedAction = null;
});

btnUploadVideo.addEventListener('click', (e) => {
  e.preventDefault();

  if (!inputVideo.files[0]) return;

  const videoUrl = window.URL.createObjectURL(inputVideo.files[0]);

  source1.src = videoUrl;

  // video.insertAdjacentHTML(
  //   'beforebegin',
  //   `
  //   <h4>You uploaded: ${inputVideo.files[0].name}</h4>
  // `
  // );

  socket.emit('uploaded', myId, inputVideo.files[0].name);

  video.load();
});

// CHAT

const btnSend = document.querySelector('#form button');
const input = document.querySelector('#input');
const ul = document.querySelector('#messages');
const chatContainer = document.querySelector('.chat-container');
const btnSaveNick = document.querySelector('#save-nickname');
const overlay = document.querySelector('.overlay');
const inputNickname = document.querySelector('#nickname-input');

let user = {
  id: Math.random().toString().slice(2),
  nickname: '',
};

btnSaveNick.addEventListener('click', (e) => {
  e.preventDefault();
  if (inputNickname.value.trim().length < 2) {
    alert('tell me ur nickname bro');
    return;
  }
  user.nickname = inputNickname.value;
  socket.emit('user', user);
  overlay.classList.add('hidden');
});

btnSend.addEventListener('click', (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit('chat message', input.value);

    ul.insertAdjacentHTML(
      'beforeend',
      `<li><b>${user.nickname}:</b> ${input.value}</li>`
    );

    input.value = '';
  }
});

socket.on('chat message', (msg) => {
  ul.insertAdjacentHTML('beforeend', `<li>${msg}</li>`);
  window.scrollIntoView(ul.lastElementChild);
});
