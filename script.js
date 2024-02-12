const soundWaveBox = document.querySelector('.soundWave');
const fileInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');
let source;
let audioContext;
let analyser;
let isPlaying = false;
let now, then, elapsed, fpsInterval;
let silenceBuffer = 2;
let silenceTreshold = 128;

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

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (!source) {
      source = audioContext.createMediaElementSource(audioPlayer);
      analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    audioPlayer.play();
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
        let isActive = gridRows - row <= numColoredCells;
        if (data2[colIndex] >= silenceTreshold - silenceBuffer && data2[colIndex] <= silenceTreshold + silenceBuffer) {
          isActive = false;
        }
        td.classList.toggle('active', isActive);
      }
    }
  }
}

audioPlayer.addEventListener('ended', function () {
  const tds = document.querySelectorAll('.soundWave td');
  tds.forEach((td) => {
    td.classList.remove('active');
  });
});

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  animate();
}

audioPlayer.addEventListener('play', function () {
  isPlaying = true;
  startAnimating(20);
});

audioPlayer.addEventListener('pause', function () {
  isPlaying = false;
});
