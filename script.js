const soundWaveBox = document.querySelector('.soundWave');
const fileInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');
let audioContext;
let analyser;
let isPlaying = false;
let now, then, elapsed, fpsInterval;

const dictionary = {
  gridRows: 6,
  gridCols: 6,
};

const { gridRows, gridCols } = dictionary;

for (let row = 0; row < gridRows; row++) {
  const tr = document.createElement('tr');
  for (let col = 0; col < gridCols; col++) {
    const td = document.createElement('td');
    tr.appendChild(td);
  }
  soundWaveBox.appendChild(tr);
}

fileInput.addEventListener('change', (event) => {
  const fileInput = event.target;

  if (fileInput.files.length > 0) {
    const audioFile = URL.createObjectURL(fileInput.files[0]);
    audioPlayer.src = audioFile;
    audioPlayer.play();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioPlayer);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
});

function animate() {
  if (!analyser || !isPlaying) return;

  requestAnimationFrame(animate);

  now = Date.now();
  elapsed = now - then;

  analyser.fftSize = 2048;
  const data = new Uint8Array(analyser.fftSize);
  let data2 = [];

  analyser.getByteTimeDomainData(data);

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    for (let i = 0; i < gridCols; i++) {
      data2.push(data[Math.floor((i * analyser.fftSize) / gridCols)]);
    }

    for (let col = 0; col < gridCols; col++) {
      const colIndex = Math.floor((col / gridCols) * data2.length);
      const amplitude = ((data2[colIndex] / 255 - 0.4) * 100) / 3;

      const numColoredCells = Math.round(amplitude);

      for (let row = gridRows - 1; row >= 0; row--) {
        const td = soundWaveBox.rows[row].cells[col];
        const isActive = gridRows - row <= numColoredCells;
        td.classList.toggle('active', isActive);
      }
    }
  }
}

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animate();
}

audioPlayer.addEventListener('play', function () {
  isPlaying = true;
  startAnimating(24);
});

audioPlayer.addEventListener('pause', function () {
  isPlaying = false;
});
