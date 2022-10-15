const canvas = document.getElementById('canvas');
const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;
const root = document.querySelector(':root');

const resizeSquares = squaresPerRow => {
  canvas.innerHTML = '';
  let size = Math.round(canvasWidth / squaresPerRow) - 1;
  root.style.setProperty('--square-size', `${size}px`);
  root.style.setProperty('--squares-per-row', `${squaresPerRow}`);

  let div;
  for (let i = 0; i < squaresPerRow ** 2; i++) {
    div = document.createElement('div');
    div.classList.add('grid-unit');
    canvas.appendChild(div);
  }
};
resizeSquares(15);
