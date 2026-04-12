const cardImages = [
  { src: 'air_bubu.mp4', match: 'air_dudu.mp4' },
  { src: 'air_dudu.mp4', match: 'air_bubu.mp4' },
  { src: 'angry_bubu.mp4', match: 'angry_dudu.mp4' },
  { src: 'angry_dudu.mp4', match: 'angry_bubu.mp4' },
  { src: 'baby_bubu.mp4', match: 'baby_dudu.mp4' },
  { src: 'baby_dudu.mp4', match: 'baby_bubu.mp4' },
  { src: 'duck_bubu.mp4', match: 'duck_dudu.mp4' },
  { src: 'duck_dudu.mp4', match: 'duck_bubu.mp4' },
  { src: 'eat_bubu.mp4', match: 'eat_dudu.mp4' },
  { src: 'eat_dudu.mp4', match: 'eat_bubu.mp4' },
  { src: 'happy_bubu.mp4', match: 'happy_dudu.mp4' },
  { src: 'happy_dudu.mp4', match: 'happy_bubu.mp4' },
  { src: 'icecream_bubu.mp4', match: 'icecream_dudu.mp4' },
  { src: 'icecream_dudu.mp4', match: 'icecream_bubu.mp4' },
  { src: 'work_bubu.mp4', match: 'work_dudu.mp4' },
  { src: 'work_dudu.mp4', match: 'work_bubu.mp4' }
];
let firstCard = null, secondCard = null, matches = 0, lockBoard = false;
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function preloadImages() {
  cardImages.forEach(({ src }) => {
    const img = new Image();
    img.src = src.replace('.mp4', '.png');
  });
}
function createCard(pair) {
  const card = document.createElement('div');
  card.classList.add('card');
  const img = document.createElement('img');
  img.src = pair.src.replace('.mp4', '.png');
  img.alt = 'card image';
  img.loading = 'lazy';
  img.classList.add('hidden');
  const video = document.createElement('video');
  video.src = pair.src;
  video.loop = true;
  video.autoplay = false;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.classList.add('hidden');
  card.appendChild(img);
  card.appendChild(video);
  card.dataset.match = pair.match;
  card.dataset.src = pair.src;
  card.dataset.status = 'unflipped';
  card.addEventListener('click', flipCard);
  return card;
}
function flipCard() {
  if (lockBoard || this === firstCard || this.dataset.status === 'matched') return;
  const video = this.querySelector('video');
  const img = this.querySelector('img');
  img.classList.add('hidden');
  video.classList.remove('hidden');
  video.currentTime = 0;
  video.play().catch(() => {});
  this.dataset.status = 'flipped';
  this.classList.add('flipped');
  if (!firstCard) firstCard = this;
  else {
    secondCard = this;
    lockBoard = true;
    checkForMatch();
  }
}
function checkForMatch() {
  const isMatch = firstCard.dataset.match === secondCard.dataset.src;
  if (isMatch) markAsMatched();
  else unflipCards();
}
function markAsMatched() {
  [firstCard, secondCard].forEach(card => {
    const video = card.querySelector('video');
    const img = card.querySelector('img');
    video.pause();
    video.remove();
    img.classList.remove('hidden');
    card.classList.add('matched');
    card.dataset.status = 'matched';
    card.removeEventListener('click', flipCard);
  });
  matches++;
  resetBoard();
  if (matches === cardImages.length / 2) setTimeout(showWinDialog, 500);
}
function unflipCards() {
  setTimeout(() => {
    [firstCard, secondCard].forEach(card => {
      const video = card.querySelector('video');
      const img = card.querySelector('img');
      video.pause();
      video.classList.add('hidden');
      img.classList.add('hidden');
      card.classList.remove('flipped');
      card.dataset.status = 'unflipped';
    });
    resetBoard();
  }, 1000);
}
function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}
function showWinDialog() {
  document.getElementById('winDialog').classList.remove('hidden');
  document.getElementById('yesButton').addEventListener('click', () => {
    document.getElementById('winDialog').classList.add('hidden');
    document.getElementById('gameBoard').classList.add('hidden');
    document.querySelector('h1').classList.add('hidden');
    showDoubleNyeheyyy();
  }, { once: true });
}
function showDoubleNyeheyyy() {
  const nyeheyyyVid = document.querySelector('.nyeheyyy-gif');
  nyeheyyyVid.currentTime = 0;
  nyeheyyyVid.play();
  document.getElementById('doubleNyeheyyySection').classList.remove('hidden');
  document.getElementById('letterButton').addEventListener('click', () => {
    document.getElementById('letterFromDuduContainer').classList.remove('hidden');
    document.getElementById('doubleNyeheyyySection').classList.add('hidden');
  }, { once: true });
}
function handleNoButtonClick() {
  const btn = document.getElementById('noButton');
  if (!btn.classList.contains('shrink')) {
    btn.classList.remove('shrink');
    void btn.offsetWidth;
    btn.classList.add('shrink');
  } else {
    btn.classList.add('hidden-button');
  }
}
document.getElementById('noButton').addEventListener('click', handleNoButtonClick);
document.getElementById('exit-button').addEventListener('click', () => {
  sessionStorage.removeItem('memoryGameLoaded');
  window.location.href = "../index.html";
});
document.getElementById('letterButton').addEventListener('click', () => {
  document.getElementById('letterFromDuduContainer').classList.remove('hidden');
  document.getElementById('doubleNyeheyyySection').classList.add('hidden');
}, { once: true });
document.getElementById('playAgainButton').addEventListener('click', () => {
  document.getElementById('letterFromDuduContainer').classList.add('hidden');
  document.getElementById('doubleNyeheyyySection').classList.add('hidden');
  document.querySelector('h1').classList.remove('hidden');
  document.getElementById('gameBoard').classList.remove('hidden');
  document.getElementById('gameBoard').innerHTML = '';
  matches = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  const noButton = document.getElementById('noButton');
  if (noButton) {
    noButton.classList.remove('hidden-button', 'shrink');
  }
  initGame();
});
function initGame() {
  shuffle(cardImages);
  preloadImages();
  const board = document.getElementById('gameBoard');
  cardImages.forEach(pair => {
    const card = createCard(pair);
    board.appendChild(card);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');
  const hasConfirmed = localStorage.getItem('musicConfirmed');
  const alreadyLoaded = sessionStorage.getItem('memoryGameLoaded');
  const loadingScreen = document.getElementById('loading-screen');
  const tapText = document.querySelector('.tap-text');
  const progressFill = document.getElementById('progress-fill');
  const progressIcon = document.getElementById('progress-icon');
  const progressWrapper = document.querySelector('.progress-wrapper');
  const exitBtn = document.getElementById('exit-button');
  if (exitBtn) exitBtn.style.display = 'none';
  const tryPlayMusic = () => {
    if (music && music.paused) music.play().catch(() => {});
  };
  const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
  const animateProgress = () => {
    const duration = 3000;
    const iconWidth = progressIcon.offsetWidth;
    const barWidth = progressWrapper.clientWidth;
    const iconOffset = 22;
    const maxLeft = barWidth - iconWidth + iconOffset;
    progressIcon.style.opacity = '1';
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutSine(t);
      const iconLeft = maxLeft * eased;
      const fillPercent = ((iconLeft + iconWidth / 2) / barWidth) * 100;
      progressIcon.style.left = `${iconLeft}px`;
      progressFill.style.width = `${fillPercent}%`;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        progressIcon.style.left = `${maxLeft}px`;
        progressFill.style.width = '100%';
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
        sessionStorage.setItem('memoryGameLoaded', 'true');
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        if (exitBtn) exitBtn.style.display = '';
      }, 600);
      window.removeEventListener('click', continueHandler, { passive: false });
      window.removeEventListener('touchstart', continueHandler, { passive: false });
    };
    window.addEventListener('click', continueHandler, { passive: false });
    window.addEventListener('touchstart', continueHandler, { passive: false });
  };
  if (!alreadyLoaded && loadingScreen && tapText) {
    document.body.style.overflow = 'hidden';
    animateProgress();
  } else {
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (exitBtn) exitBtn.style.display = '';
    if (hasConfirmed) tryPlayMusic();
    else {
      const enableMusic = () => {
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        window.removeEventListener('click', enableMusic);
        window.removeEventListener('touchstart', enableMusic);
        window.removeEventListener('scroll', enableMusic);
      };
      window.addEventListener('click', enableMusic, { once: true });
      window.addEventListener('touchstart', enableMusic, { once: true });
      window.addEventListener('scroll', enableMusic, { once: true });
    }
  }
  initGame();
});