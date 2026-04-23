document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');

  // Disable context menu (moved from inline HTML attribute)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // ── Loading screen ──────────────────────────────────────────────
  const loadingScreen = document.createElement('div');
  loadingScreen.id = 'loading-screen';
  Object.assign(loadingScreen.style, {
    position:       'fixed',
    top:            '0',
    left:           '0',
    width:          '100vw',
    height:         '100vh',
    background:     'linear-gradient(160deg, #fff5f9 0%, #ffdcea 55%, #ffe8f2 100%)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '1rem',
    zIndex:         '9999',
  });

  const iconWrapper = document.createElement('div');
  Object.assign(iconWrapper.style, {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    animation:      'shrinkThenBounceSize 2s ease forwards',
  });

  const icon = document.createElement('img');
  icon.src = 'icon-512.png';
  icon.id  = 'loading-icon';
  Object.assign(icon.style, {
    width:        '152px',
    height:       '152px',
    borderRadius: '22px',
    objectFit:    'contain',
    boxShadow:    '0 8px 28px rgba(162, 0, 96, 0.22)',
  });

  const titleEl = document.createElement('div');
  titleEl.textContent = 'LalaHub';
  Object.assign(titleEl.style, {
    fontFamily:  "'Jua', sans-serif",
    fontSize:    '3rem',
    color:       '#a20060',
    letterSpacing: '0.06em',
    textShadow:  '0 1px 4px rgba(255, 105, 180, 0.3)',
  });

  const tapText = document.createElement('div');
  tapText.className   = 'tap-text';
  tapText.textContent = 'Tap to continue';
  Object.assign(tapText.style, {
    fontFamily:    "'Jua', sans-serif",
    fontSize:      '1.5rem',
    color:         '#d45487',
    visibility:    'hidden',
    letterSpacing: '0.04em',
  });

  iconWrapper.appendChild(icon);
  loadingScreen.appendChild(iconWrapper);
  loadingScreen.appendChild(titleEl);
  loadingScreen.appendChild(tapText);
  document.body.appendChild(loadingScreen);
  document.body.style.overflow = 'hidden';

  // Attempt playback on any subsequent user interaction
  function tryPlayMusic() {
    if (music && music.paused) {
      music.play().catch(() => { });
    }
  }

  function attachResumeListeners() {
    window.addEventListener('click',      tryPlayMusic);
    window.addEventListener('touchstart', tryPlayMusic);
    window.addEventListener('scroll',     tryPlayMusic);
  }

  function detachResumeListeners() {
    window.removeEventListener('click',      tryPlayMusic);
    window.removeEventListener('touchstart', tryPlayMusic);
    window.removeEventListener('scroll',     tryPlayMusic);
  }

  // Remove resume listeners once music is confirmed playing
  function onMusicPlaying() {
    detachResumeListeners();
    music.removeEventListener('playing', onMusicPlaying);
  }

  setTimeout(() => {
    icon.classList.add('bounce');
    tapText.style.visibility = 'visible';
    tapText.classList.add('show');
    setTimeout(() => {
      tapText.classList.remove('show');
      tapText.classList.add('loop');
    }, 800);

    const handleFirstTap = (e) => {
      e.preventDefault();
      e.stopPropagation();
      loadingScreen.classList.add('exit');

      window.removeEventListener('click',      handleFirstTap);
      window.removeEventListener('touchstart', handleFirstTap);

      setTimeout(() => {
        loadingScreen.remove();
        document.body.style.overflow = '';

        music.addEventListener('playing', onMusicPlaying);
        music.play().catch(() => {
          // Autoplay blocked — attach resume listeners as fallback
          attachResumeListeners();
        });
      }, 600);
    };

    window.addEventListener('click',      handleFirstTap, { passive: false });
    window.addEventListener('touchstart', handleFirstTap, { passive: false });
  }, 2500);

  // ── Force update button ─────────────────────────────────────────
  const updateButton = document.getElementById('force-update');
  if (updateButton) {
    updateButton.addEventListener('click', async () => {
      updateButton.classList.add('spinning');
      updateButton.addEventListener('animationend', () => {
        updateButton.classList.remove('spinning');
      }, { once: true });

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) await reg.unregister();
        const cacheNames = await caches.keys();
        for (const name of cacheNames) await caches.delete(name);
        window.location.reload();
      }
    });
  }

  // ── Secret card ─────────────────────────────────────────────────
  const secretCard = document.querySelector('#secret-card a');
  if (secretCard) {
    secretCard.addEventListener('click', (e) => {
      e.preventDefault();
      const userInput = prompt('Bawal ka pa rito bantotie ka! >:((');
      if (userInput === '13') {
        window.location.href = secretCard.getAttribute('href');
      } else if (userInput !== null) {
        alert('Bantotie ka! >:((');
      }
    });
  }
});