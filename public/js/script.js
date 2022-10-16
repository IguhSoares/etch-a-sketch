const canvas = document.getElementById('canvas');
const root = document.querySelector(':root');

const isMobile = () => {
  return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
    navigator.userAgent
  );
};

const resetClasses = element => {
  element.setAttribute('class', 'pixel');
};

const cancelEvent = event => (event.target.onpointerenter = '');

const setBlackBg = event => {
  event.target.classList.add('black-bg');
  cancelEvent(event);
};

const setRandomBg = event => {
  event.target.classList.add('change-bg-color');
  event.target.style.setProperty('--h-value', Math.round(Math.random() * 300));
  event.target.style.setProperty('--l-value', '46%');
};

const setDarkeningBg = event => {
  event.target.classList.add('change-bg-color');
  event.target.style.setProperty('--h-value', '96');

  const lValue =
    parseInt(event.target.style.getPropertyValue('--l-value')) || 100;

  if (lValue !== 0) {
    let newValue = lValue >= 10 ? lValue - 10 : 0;
    event.target.style.setProperty('--l-value', `${newValue}%`);
    if (newValue === 0) cancelEvent(event);
  }
};

const touchScreenHandler = event => {
  let startPixel = document.elementFromPoint(
    event.touches[0].clientX,
    event.touches[0].clientY
  );

  event.target.ontouchmove = event => {
    event.preventDefault();
    let currentPixel = document.elementFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY
    );

    if (startPixel != currentPixel) {
      currentPixel.dispatchEvent(new Event('pointerenter'));
      startPixel = currentPixel;
    }
  };
};

const setSquaresSize = squaresPerRow => {
  const canvasWidth = canvas.clientWidth;

  let size = Math.round(canvasWidth / squaresPerRow) - 1;

  root.style.setProperty('--square-size', `${size}px`);
  root.style.setProperty('--squares-per-row', `${squaresPerRow}`);

  return size;
};

const resizeCanvas = () => {
  const squaresPerRow = parseInt(
    document.getElementById('number-of-columns').value
  );

  setSquaresSize(squaresPerRow);
  canvas.style.setProperty('height', 'fit-content');
};

const renderCanvas = squaresPerRow => {
  canvas.innerHTML = '';

  const size = setSquaresSize(squaresPerRow);
  const canvasHeight = canvas.clientHeight;

  let div;
  for (let i = 0; i < squaresPerRow * Math.floor(canvasHeight / size); i++) {
    div = document.createElement('div');
    div.setAttribute('id', i);
    div.classList.add('pixel');
    div.onpointerenter = setBlackBg;

    if (isMobile()) {
      div.addEventListener('touchstart', touchScreenHandler);
    }
    canvas.appendChild(div);
  }

  document
    .getElementById('number-of-columns')
    .setAttribute('value', squaresPerRow);
};

const resetCanvas = () => {
  const inputField = document.getElementById('number-of-columns');
  const columns = parseInt(document.getElementById('number-of-columns').value);

  if (!columns || columns <= 0) {
    inputField.value = '';
    inputField.setAttribute('placeholder', 'Type in a positive number');
  } else if (columns > 100) {
    inputField.value = '';
    inputField.setAttribute('placeholder', 'Number > 100 not allowed');
  } else {
    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach(box => (box.checked = false));

    canvas.style.removeProperty('height');
    renderCanvas(columns);
  }
};

const initResetCanvasHandlers = () => {
  document.getElementById('reset-canvas-btn').onclick = resetCanvas;
  document.getElementById('number-of-columns').onchange = resetCanvas;
  document.getElementById('number-of-columns').onkeyup = e => {
    if (e.key === 'Enter') resetCanvas();
  };
};

const initColorModeHandler = mode => {
  const otherMode = {
    'random-color-mode': 'progressive-darkening-mode',
    'progressive-darkening-mode': 'random-color-mode',
  };

  const handler = {
    'random-color-mode': setRandomBg,
    'progressive-darkening-mode': setDarkeningBg,
  };

  document.getElementById(mode).onchange = e => {
    let eventHandler;
    if (e.target.checked) {
      document.getElementById(otherMode[mode]).disabled = true;
      eventHandler = handler[mode];
    } else {
      document.getElementById(otherMode[mode]).disabled = false;
      eventHandler = setBlackBg;
    }
    document.querySelectorAll('.pixel').forEach(square => {
      resetClasses(square);
      square.onpointerenter = eventHandler;
    });
  };
};

const start = () => {
  renderCanvas(30);
  initResetCanvasHandlers();
  ['random-color-mode', 'progressive-darkening-mode'].forEach(mode =>
    initColorModeHandler(mode)
  );
  window.onresize = resizeCanvas;
};

start();
