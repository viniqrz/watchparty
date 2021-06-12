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

// setTimeout(() => {
//   video.pause();
// }, 2000)

setInterval(() => {
  time1 = Date.now();
  socket.emit('ping', time1);
}, 3000)

socket.on('pong', (time2) => {
  console.log(myId + ' PING: ' + (time2 - time1));
})

socket.on('play', () => {
  video.play();
});

socket.on('pause', () => {
  video.pause();
});

socket.on('uploaded', (user, fileName) => {
  video.insertAdjacentHTML('beforebegin', `
    <h4>User ${user} uploaded: ${fileName} and invites you to upload the same file.</h4>
  `);
});


video.addEventListener('play', () => {
  socket.emit('play', 'playuuuu');
})

video.addEventListener('pause', () => {
  socket.emit('pause', 'pauseeeeee');
})


btnUploadVideo.addEventListener('click', (e) => {
  e.preventDefault();


  const videoUrl = window.URL.createObjectURL(inputVideo.files[0]);

  // video.src = videoUrl;
  source1.src = videoUrl;
  video.insertAdjacentHTML('beforebegin', `
    <h4>You uploaded: ${inputVideo.files[0].name}</h4>
  `);

  socket.emit('uploaded', myId, inputVideo.files[0].name);
  // console.log(inputVideo.files[0].name)
  // video.insertAdjacentHTML('afterbegin', `
  //   <source id="source-video" src="${videoUrl}" type="video/webm" />
  // `)
  video.load();

  // document.body.insertAdjacentHTML('beforeend', `
  //   <video
  //     id="my-video"
  //     class="video-js vjs-big-play-centered"
  //     controls
  //     preload="auto"
  //     poster=""
  //     data-setup="{}"
  //   >
  //     <source src="${videoUrl}" type="video/webm">
  //     <track onCLick="alert(1)" class="upload-cc" label="Upload" srclang="en" />
  //     <p class="vjs-no-js">
  //       To view this video please enable JavaScript, and consider upgrading to a
  //       web browser that
  //       <a href="https://videojs.com/html5-video-support/" target="_blank"
  //         >supports HTML5 video</a
  //       >
  //     </p>
  //   </video>
  // `);
});

uploadCc.addEventListener('click', function (e) {
  alert(1);
});
