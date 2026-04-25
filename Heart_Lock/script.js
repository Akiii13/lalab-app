const digits = [0, 0, 0, 0];
const correctCode = '0313';
const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const SPOTIFY_URL = 'https://open.spotify.com/track/3LvrJEPQ61Vvj1t3Edg20X';

let qrGenerated = false;
let scratchComplete = false;
let isScratching = false;

function changeDigit(index, delta) {
  digits[index] = (digits[index] + delta + 10) % 10;
  const el = document.getElementById(`digit-${index}`);
  el.textContent = digits[index];
  el.classList.remove('changed');
  void el.offsetWidth;
  el.classList.add('changed');
  checkCode();
}

function checkCode() {
  if (digits.join('') !== correctCode) return;
  document.getElementById('lockScreen').style.display = 'none';
  const letterScreen = document.getElementById('letterScreen');
  letterScreen.style.display = 'block';
  letterScreen.classList.remove('visible');
  void letterScreen.offsetWidth;
  letterScreen.classList.add('visible');
  requestAnimationFrame(() => {
    if (!qrGenerated) {
      generateQR();
      qrGenerated = true;
    }
    resizeCanvas();
  });
}

function generateQR() {
  const qrDiv = document.getElementById('qrCode');
  const size = qrDiv.offsetWidth || 120;
  new QRCode(qrDiv, {
    text: SPOTIFY_URL,
    width: size,
    height: size,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#a878d8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  scratchComplete = false;
  canvas.style.cursor = 'crosshair';
}

function getScratchPercent() {
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparent = 0;
  const total = width * height;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 10) transparent++;
  }
  return transparent / total;
}

function showScratchHint() {
  let hint = document.getElementById('scratchHint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'scratchHint';
    hint.textContent = 'Tap to open';
    canvas.parentElement.appendChild(hint);
  }
  hint.classList.add('visible');
}

function hideScratchHint() {
  const hint = document.getElementById('scratchHint');
  if (hint) hint.classList.remove('visible');
}

function scratch(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  if (!scratchComplete && getScratchPercent() >= 0.8) {
    scratchComplete = true;
    canvas.style.cursor = 'pointer';
    showScratchHint();
  }
}

function lockAgain() {
  const letterScreen = document.getElementById('letterScreen');
  letterScreen.style.display = 'none';
  letterScreen.classList.remove('visible');
  document.getElementById('lockScreen').style.display = 'flex';
  digits.fill(0);
  for (let i = 0; i < 4; i++) {
    document.getElementById(`digit-${i}`).textContent = '0';
  }
  resizeCanvas();
  hideScratchHint();
}

function exitGame() {
  sessionStorage.removeItem('gameLoadedOnce');
  window.location.href = '../index.html';
}

document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
document.body.onmousedown = e => e.preventDefault();

// Scratch interactions
canvas.addEventListener('mousedown', () => {
  isScratching = true;
  canvas.addEventListener('mousemove', scratch);
});
canvas.addEventListener('mouseup', () => {
  isScratching = false;
  canvas.removeEventListener('mousemove', scratch);
});
canvas.addEventListener('click', () => {
  if (scratchComplete) window.open(SPOTIFY_URL, '_blank');
});
canvas.addEventListener('touchstart', (e) => {
  isScratching = true;
  scratch(e);
}, { passive: false });
canvas.addEventListener('touchmove', scratch, { passive: false });
canvas.addEventListener('touchend', (e) => {
  isScratching = false;
  if (scratchComplete) {
    e.preventDefault();
    window.open(SPOTIFY_URL, '_blank');
  }
}, { passive: false });

window.addEventListener('resize', () => {
  if (document.getElementById('letterScreen').style.display !== 'none') {
    resizeCanvas();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');
  const hasConfirmed = localStorage.getItem('musicConfirmed');
  const alreadyLoaded = sessionStorage.getItem('gameLoadedOnce');
  const fromHub = document.referrer.includes('index.html');
  const loadingScreen = document.getElementById('loading-screen');
  const tapText = document.querySelector('.tap-text');
  const progressFill = document.getElementById('progress-fill');
  const progressIcon = document.getElementById('progress-icon');
  const progressWrapper = document.querySelector('.progress-wrapper');
  const exitBtn = document.getElementById('exitButton');

  const tryPlayMusic = () => {
    if (music && music.paused) music.play().catch(() => { });
  };

  const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

  const animateProgress = () => {
    const iconWidth = progressIcon.offsetWidth;
    const barWidth = progressWrapper.clientWidth;
    const iconOffset = 22;
    const maxLeft = barWidth - iconWidth + iconOffset;
    const duration = 3000;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutSine(t);
      progressIcon.style.left = (maxLeft * eased) + 'px';
      progressFill.style.width = ((maxLeft * eased + iconWidth / 2) / barWidth * 100) + '%';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        progressFill.style.width = '100%';
        progressIcon.style.left = maxLeft + 'px';
        setTimeout(() => {
          tapText.classList.add('show');
          setTimeout(() => {
            tapText.classList.add('loop');
            enableTap();
          }, 800);
        }, 300);
      }
    };
    requestAnimationFrame(step);
  };

  const enableTap = () => {
    const continueHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      loadingScreen.classList.add('exit');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.body.style.overflow = '';
        sessionStorage.setItem('gameLoadedOnce', 'true');
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        if (exitBtn) exitBtn.style.display = 'block';
      }, 600);
      window.removeEventListener('click', continueHandler, { passive: false });
      window.removeEventListener('touchstart', continueHandler, { passive: false });
    };
    window.addEventListener('click', continueHandler, { passive: false });
    window.addEventListener('touchstart', continueHandler, { passive: false });
  };

  if (fromHub && !alreadyLoaded && loadingScreen && tapText) {
    document.body.style.overflow = 'hidden';
    if (exitBtn) exitBtn.style.display = 'none';
    progressIcon.style.opacity = '1';
    animateProgress();
  } else {
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (exitBtn) exitBtn.style.display = 'block';
    if (hasConfirmed) {
      tryPlayMusic();
    } else {
      const enableMusic = () => {
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        window.removeEventListener('click', enableMusic);
        window.removeEventListener('touchstart', enableMusic);
      };
      window.addEventListener('click', enableMusic, { once: true });
      window.addEventListener('touchstart', enableMusic, { once: true });
    }
  }
});