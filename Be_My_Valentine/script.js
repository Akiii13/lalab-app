let noClickCount = 0;

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.querySelectorAll('video').forEach(v => v.pause());
  });
  const target = document.getElementById(`page-${page}`);
  target.classList.add('active');
  target.querySelectorAll('video').forEach(v => {
    v.currentTime = 0;
    v.play();
  });
}

function handleNoClick() {
  noClickCount++;
  if (noClickCount === 1) {
    goTo('no1');
    shrinkNo('no-button-1', 0.5);
  } else if (noClickCount === 2) {
    goTo('no2');
    shrinkNo('no-button-2', 0.2);
  } else {
    goTo('no3');
  }
}

function shrinkNo(id, scale) {
  const btn = document.getElementById(id);
  if (btn) btn.style.transform = `scale(${scale})`;
}

function resetGame() {
  noClickCount = 0;
  goTo('index');
}

function exitGame() {
  sessionStorage.removeItem('valentineLoaded');
  window.location.href = '../index.html';
}

function playIndexVideos() {
  document.querySelectorAll('#page-index video').forEach(v => {
    v.currentTime = 0;
    v.play().catch(() => {});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');
  const alreadyLoaded = sessionStorage.getItem('valentineLoaded');
  const loadingScreen = document.getElementById('loading-screen');
  const tapText = document.querySelector('.tap-text');
  const progressFill = document.getElementById('progress-fill');
  const progressIcon = document.getElementById('progress-icon');
  const progressWrapper = document.querySelector('.progress-wrapper');

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
      const iconPos = maxLeft * eased;
      const fillPercent = ((iconPos + iconWidth / 2) / barWidth) * 100;
      progressIcon.style.left = iconPos + 'px';
      progressFill.style.width = fillPercent + '%';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        progressIcon.style.left = maxLeft + 'px';
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
        sessionStorage.setItem('valentineLoaded', 'true');
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        playIndexVideos();
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
    tryPlayMusic();
    playIndexVideos();
  }
});