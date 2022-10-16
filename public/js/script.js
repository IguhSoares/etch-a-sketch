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
  resetClasses(event.target);
  event.target.classList.add(
    `bg-${document.getElementById('current-color').getAttribute('color')}`
  );
  cancelEvent(event);
};

const setRandomBg = event => {
  resetClasses(event.target);

  event.target.classList.add('random-bg');
  event.target.style.setProperty('--h-value', Math.round(Math.random() * 300));
};

const resetBg = event => resetClasses(event.target);

const setDarkeningBg = event => {
  resetClasses(event.target);

  event.target.classList.add('darkening-bg');

  const currentColor = document
    .getElementById('current-color')
    .getAttribute('color');

  let hValue;
  let sValue = 96;
  const lValue =
    parseInt(event.target.style.getPropertyValue('--l-value')) || 100;

  if (currentColor === 'black') {
    hValue = 0;
    sValue = 0;
  } else {
    hValue = currentColor;
  }

  if (lValue !== 0) {
    let newValue = lValue >= 10 ? lValue - 10 : 0;
    event.target.style.setProperty('--h-value', `${hValue}`);
    event.target.style.setProperty('--s-value', `${sValue}%`);
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
  document.getElementById('current-color').setAttribute('color', 'black');
  document.getElementById('current-color').removeAttribute('style');

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
    document.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = false;
      box.dispatchEvent(new Event('change'));
    });

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
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  const handler = {
    'random-color-mode': setRandomBg,
    'progressive-darkening-mode': setDarkeningBg,
    'erase-mode': resetBg,
  };

  document.getElementById(mode).onchange = e => {
    let eventHandler;
    if (e.target.checked) {
      checkboxes.forEach(cb => {
        if (cb !== e.target) {
          cb.disabled = true;
        }
      });
      eventHandler = handler[mode];
    } else {
      checkboxes.forEach(cb => (cb.disabled = false));
      eventHandler = setBlackBg;
    }
    document.querySelectorAll('.pixel').forEach(square => {
      square.onpointerenter = eventHandler;
    });
  };
};

const colorsStyle = document.createElement('style');
document.getElementsByTagName('head')[0].appendChild(colorsStyle);

const changeColor = () => {
  const colorDisplay = document.getElementById('current-color');
  const currentColor =
    parseInt(colorDisplay.style.getPropertyValue('--h-value')) || 0;

  let newColor = 0;
  let lValue = '46%';
  if (colorDisplay.style.getPropertyValue('--l-value') === '') {
    colorDisplay.style.setProperty('--l-value', lValue);
  } else if (currentColor < 300) {
    newColor = currentColor + 30;
  } else {
    colorDisplay.style.removeProperty('--l-value');
    lValue = '0%';
    newColor = 'black';
  }

  colorDisplay.style.setProperty(
    '--h-value',
    newColor === 'black' ? 0 : newColor
  );
  colorDisplay.setAttribute('color', newColor);

  if (!colorsStyle.innerText.match(`bg-${newColor}`)) {
    colorsStyle.append(
      `.bg-${newColor} {background-color: hsl(${newColor}, 66%, ${lValue})}`
    );
  }
};

const initChangeColorHandler = () => {
  document.getElementById('change-color-btn').onclick = changeColor;
};

const start = squaresPerRow => {
  renderCanvas(squaresPerRow);
  initResetCanvasHandlers();
  initChangeColorHandler();
  ['erase-mode', 'random-color-mode', 'progressive-darkening-mode'].forEach(
    mode => initColorModeHandler(mode)
  );
  window.onresize = resizeCanvas;
};

start(30);
