const soundWaveBox = document.querySelector('.soundWave');
const fileInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audioPlayer);

source.connect(analyser);
analyser.connect(audioContext.destination);

const dictionary = {
  gridRows: 6,
  gridCols: 6,
};

const { gridRows, gridCols } = dictionary;

// Display Grid
for (let row = 0; row < gridRows; row++) {
  const tr = document.createElement('tr');
  for (let col = 0; col < gridCols; col++) {
    const td = document.createElement('td');
    tr.appendChild(td);
  }
  soundWaveBox.appendChild(tr);
}

// Get Input
fileInput.addEventListener('change', (event) => {
  const fileInput = event.target;

  if (fileInput.files.length > 0) {
    const audioFile = URL.createObjectURL(fileInput.files[0]);
    audioPlayer.src = audioFile;
    audioPlayer.play();
  }
});

audioPlayer.addEventListener('timeupdate', function () {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  for (let col = 0; col < gridCols; col++) {
    const colIndex = Math.floor((col / gridCols) * data.length);
    const amplitude = data[colIndex] / 256;

    // Number of cells to color
    const numColoredCells = Math.floor(amplitude * gridRows);

    for (let row = gridRows - 1; row >= 0; row--) {
      const td = soundWaveBox.rows[row].cells[col];

      if (gridRows - row <= numColoredCells) {
        td.classList.add('active');
      } else {
        td.classList.remove('active');
      }
    }
  }
});
