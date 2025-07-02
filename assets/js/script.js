const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let analyser, dataArray, audioContext, sourceNode, animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startVisualizer(audioEl) {
  cancelAnimationFrame(animationId);
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 64;

  sourceNode = audioContext.createMediaElementSource(audioEl);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  draw();
}

function draw() {
  animationId = requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / dataArray.length;
  const centerY = canvas.height / 2;

  let total = 0;

  dataArray.forEach((value, i) => {
    const barHeight = value * 1.5;
    const x = i * barWidth;
    const hue = (i / dataArray.length) * 360;

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight);

    total += value;
  });

  const avg = total / dataArray.length;

  // 🌈 Set background intensity
  if (avg < 40) {
    document.body.setAttribute('data-intensity', 'low');
  } else if (avg < 90) {
    document.body.setAttribute('data-intensity', 'mid');
  } else if (avg < 140) {
    document.body.setAttribute('data-intensity', 'high');
  } else {
    document.body.setAttribute('data-intensity', 'peak');
  }

  const icons = document.querySelectorAll('.social-icon');

if (avg > 120) {
  icons.forEach(icon => icon.style.boxShadow = `0 0 20px var(--neon-blue), 0 0 60px var(--neon-pink)`);
} else if (avg > 80) {
  icons.forEach(icon => icon.style.boxShadow = `0 0 12px var(--neon-blue), 0 0 30px var(--neon-blue)`);
} else {
  icons.forEach(icon => icon.style.boxShadow = `0 0 6px var(--neon-blue)`);
}


  // 💥 Pulse platter subtly
  const platter = document.getElementById('platter');
  if (avg > 100) {
    platter.classList.add('pulse');
    setTimeout(() => platter.classList.remove('pulse'), 200);
  }
}




const platter = document.getElementById('platter');
const titleEl = document.querySelector('.track-title');
const pauseBtn = document.querySelector('.pause-btn');
const ejectBtn = document.querySelector('.eject-btn');
const volumeSlider = document.querySelector('.volume-slider');
const waveformBar = document.querySelector('.waveform-bar');
let currentAudio = null;

document.querySelectorAll('.vinyl-img').forEach(vinyl => {
  vinyl.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('imageSrc', vinyl.src);
    e.dataTransfer.setData('trackTitle', vinyl.dataset.track);
    e.dataTransfer.setData('audioSrc', vinyl.dataset.audio);
  })
  document.querySelectorAll('.vinyl-img').forEach(vinyl => {
  // Existing dragstart listener...
  vinyl.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('imageSrc', vinyl.src);
    e.dataTransfer.setData('trackTitle', vinyl.dataset.track);
    e.dataTransfer.setData('audioSrc', vinyl.dataset.audio);
  });

  // 🆕 Tap-to-load fallback for mobile
  vinyl.addEventListener('click', () => {
    const imageSrc = vinyl.src;
    const title = vinyl.dataset.track;
    const audioSrc = vinyl.dataset.audio;

    platter.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = title;
    img.className = 'loaded-vinyl';
    platter.appendChild(img);

    titleEl.textContent = title;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioSrc);
    currentAudio.crossOrigin = "anonymous";
    currentAudio.loop = true;
    currentAudio.volume = parseFloat(volumeSlider.value);
    currentAudio.play();
    startVisualizer(currentAudio);

    pauseBtn.textContent = '⏸️';
    waveformBar.style.display = 'block';
  });
});;
});

platter.addEventListener('dragover', e => e.preventDefault());
platter.addEventListener('drop', (e) => {
  e.preventDefault();
  const imageSrc = e.dataTransfer.getData('imageSrc');
  const title = e.dataTransfer.getData('trackTitle');
  const audioSrc = e.dataTransfer.getData('audioSrc');

  platter.innerHTML = '';
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = title;
  img.className = 'loaded-vinyl';
  platter.appendChild(img);

  titleEl.textContent = title;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

currentAudio = new Audio(audioSrc);
currentAudio.crossOrigin = "anonymous";
currentAudio.loop = true;
currentAudio.volume = parseFloat(volumeSlider.value);
currentAudio.play();
startVisualizer(currentAudio);

  pauseBtn.textContent = '⏸️';
  waveformBar.style.display = 'block';
});

pauseBtn.addEventListener('click', () => {
  if (!currentAudio) return;
  if (currentAudio.paused) {
    currentAudio.play();
    pauseBtn.textContent = '⏸️';
  } else {
    currentAudio.pause();
    pauseBtn.textContent = '▶️';
  }
});

volumeSlider.addEventListener('input', () => {
  if (currentAudio) {
    currentAudio.volume = parseFloat(volumeSlider.value);
  }
});

ejectBtn.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  platter.innerHTML = '';
  titleEl.textContent = 'Drop a vinyl';
  pauseBtn.textContent = '⏸️';
  waveformBar.style.display = 'none';
});

const durationInput = document.getElementById('duration');
const durationValue = document.getElementById('durationValue');
const bookingForm = document.getElementById('bookingForm');
const bookingResponse = document.getElementById('bookingResponse');

durationInput.addEventListener('input', () => {
  durationValue.textContent = `${durationInput.value} hrs`;
});

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  bookingResponse.textContent = '🎶 Booking request sent!';
  bookingForm.reset();
  durationValue.textContent = `4 hrs`;
});
