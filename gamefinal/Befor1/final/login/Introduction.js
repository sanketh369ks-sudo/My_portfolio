// script.js – handles the Play Video button

document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('playBtn');
  const videoWrapper = document.getElementById('videoWrapper');
  const video = document.getElementById('welcomeVideo');

  // When the button is clicked, hide it, reveal the video container and autoplay
  playBtn.addEventListener('click', () => {
    playBtn.style.display = 'none';
    videoWrapper.style.display = 'block';
    video.play();
  });

  // When video ends, hide video and show submit button
  video.addEventListener('ended', () => {
    videoWrapper.style.display = 'none';
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.style.display = 'inline-block';
    // Navigate to login page on click
    submitBtn.addEventListener('click', () => {
      window.location.href = "login2/login.html";
    });
  });
});


