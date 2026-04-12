const btn = document.getElementById('drawBtn');
const input = document.getElementById('commandInput');
const exitBtn = document.getElementById('exit-btn');
const notif = document.getElementById('notification');
const flowerContainer = document.querySelector('.rose-container');
const music = document.getElementById('bg-music');
const loadingScreen = document.getElementById('loading-screen');
const tapText = document.querySelector('.tap-text');
const progressFill = document.getElementById('progress-fill');
const progressIcon = document.getElementById('progress-icon');
const progressWrapper = document.querySelector('.progress-wrapper');
const flowerMessages = [
  `Nyeheheee flowers for bubu!!🌸 >:33`,
  `Fabooty flowerss!! >:DD`,
  `Dudu flowers for Bubuuu!! >:DD`,
  `Flowers ka sakinnn!! >;P`,
  `You loves me... you loves me not... you loves me!! >:DD`
];
const bantotMessages = [
  `Bantotie ka!! >:((`,
  `Hanyaaa!! >:UU`,
  `Wala to guyss >:UU`
];
let isAnimating = false;
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}
function showNotification(message, isError = false) {
  return new Promise((resolve) => {
    notif.textContent = message;
    notif.className = isError ? 'error' : 'success';
    setTimeout(() => {
      notif.classList.add('hidden');
      setTimeout(() => {
        notif.className = 'hidden';
        resolve();
      }, 300);
    }, 2000);
  });
}
function cleanInput(text) {
  return text.toLowerCase().replace(/[.,!?]/g, '').trim();
}
function colorizeRose(color) {
  document.querySelectorAll('.petal').forEach((petal, i) => {
    if (i === 2 || i === 3) {
      petal.style.background = darkenColor(color, 20);
    } else {
      petal.style.background = color;
    }
  });
}
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
}
btn.addEventListener('click', async () => {
  if (isAnimating) return;
  btn.classList.remove('bounce');
  void btn.offsetWidth;
  btn.classList.add('bounce');
  const raw = input.value;
  const cleaned = cleanInput(raw);
  const triggers = ['hello', 'hi', 'how are you', 'what', 'bantot', 'fabooty', 'cutie', 'buttcrack', 'dudu', 'thank you', 'wala', 'ano'];
  const matches = triggers.some(trigger => cleaned.includes(trigger));
  isAnimating = true;
  btn.disabled = true;
  input.disabled = true;
  exitBtn.disabled = true;
  if (matches) {
    const color = getRandomColor();
    const message = flowerMessages[Math.floor(Math.random() * flowerMessages.length)];
    colorizeRose(color);
    flowerContainer.classList.remove('hidden');
    await showNotification(message);
  } else {
    const errorMessage = bantotMessages[Math.floor(Math.random() * bantotMessages.length)];
    await showNotification(errorMessage, true);
  }
  isAnimating = false;
  btn.disabled = false;
  input.disabled = false;
  exitBtn.disabled = false;
});
exitBtn.addEventListener('click', () => {
  sessionStorage.removeItem('digitalflower');
  window.location.href = "../index.html";
});
document.addEventListener('DOMContentLoaded', () => {
  const hasConfirmed = localStorage.getItem('musicConfirmed');
  const alreadyLoaded = sessionStorage.getItem('digitalflower');
  const tryPlayMusic = () => {
    if (music && music.paused) music.play().catch(() => {});
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
        sessionStorage.setItem('digitalflower', 'true');
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        exitBtn.classList.remove('hidden');
      }, 600);
      window.removeEventListener('click', continueHandler, { passive: false });
      window.removeEventListener('touchstart', continueHandler, { passive: false });
    };
    window.addEventListener('click', continueHandler, { passive: false });
    window.addEventListener('touchstart', continueHandler, { passive: false });
  };
  if (!alreadyLoaded && loadingScreen && tapText) {
    document.body.style.overflow = 'hidden';
    progressIcon.style.opacity = '1';
    animateProgress();
  } else {
    if (loadingScreen) loadingScreen.style.display = 'none';
    exitBtn.classList.remove('hidden');
    const enableMusic = () => {
      tryPlayMusic();
      localStorage.setItem('musicConfirmed', 'yes');
      window.removeEventListener('click', enableMusic);
      window.removeEventListener('touchstart', enableMusic);
    };
    if (!hasConfirmed) {
      window.addEventListener('click', enableMusic, { once: true });
      window.addEventListener('touchstart', enableMusic, { once: true });
    } else {
      tryPlayMusic();
    }
  }
});