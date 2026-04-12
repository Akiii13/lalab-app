document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');
  const loadingScreen = document.createElement('div');
  const iconWrapper = document.createElement('div');
  const icon = document.createElement('img');
  const tapText = document.createElement('div');
  const textSpacer = document.createElement('div');
  loadingScreen.id = 'loading-screen';
  Object.assign(loadingScreen.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: '#ffb5c9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999'
  });
  iconWrapper.style.display = 'flex';
  iconWrapper.style.alignItems = 'center';
  iconWrapper.style.justifyContent = 'center';
  iconWrapper.style.animation = 'shrinkThenBounceSize 2.5s ease forwards';
  icon.src = 'icon-512.png';
  icon.id = 'loading-icon';
  Object.assign(icon.style, {
    objectFit: 'contain',
    width: '120px',
    height: '120px'
  });
  tapText.className = 'tap-text';
  tapText.textContent = 'Tap to continue...';
  tapText.style.color = '#a20060';
  tapText.style.fontSize = '1.2rem';
  tapText.style.display = 'none';
  textSpacer.style.height = '2rem';
  textSpacer.style.display = 'flex';
  textSpacer.style.alignItems = 'center';
  textSpacer.style.justifyContent = 'center';
  textSpacer.appendChild(tapText);
  iconWrapper.appendChild(icon);
  loadingScreen.appendChild(iconWrapper);
  loadingScreen.appendChild(textSpacer);
  document.body.appendChild(loadingScreen);
  document.body.style.overflow = 'hidden';
  function tryPlayMusic() {
    if (music && music.paused) music.play().catch(() => {});
  }
  setTimeout(() => {
    icon.classList.add('bounce');
    tapText.style.display = 'block';
    tapText.classList.add('tap-text');
    setTimeout(() => {
      tapText.classList.add('loop');
    }, 800);
    const handleFirstTap = (e) => {
      e.preventDefault();
      e.stopPropagation();
      loadingScreen.classList.add('exit');
      setTimeout(() => {
        loadingScreen.remove();
        document.body.style.overflow = '';
        const hasConfirmed = localStorage.getItem('musicConfirmed');
        if (!hasConfirmed) {
          music.play().then(() => {
            localStorage.setItem('musicConfirmed', 'yes');
          }).catch(() => {});
        } else {
          tryPlayMusic();
        }
        const tryResumeMusic = () => tryPlayMusic();
        window.addEventListener('click', tryResumeMusic);
        window.addEventListener('touchstart', tryResumeMusic);
        window.addEventListener('scroll', tryResumeMusic);
      }, 600);
      window.removeEventListener('click', handleFirstTap);
      window.removeEventListener('touchstart', handleFirstTap);
    };
    window.addEventListener('click', handleFirstTap, { passive: false });
    window.addEventListener('touchstart', handleFirstTap, { passive: false });
  }, 3000);
  const updateButton = document.getElementById('force-update');
  if (updateButton) {
    updateButton.addEventListener('click', async () => {
      updateButton.classList.add('bounce');
      setTimeout(() => updateButton.classList.remove('bounce'), 200);
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) await reg.unregister();
        const cacheNames = await caches.keys();
        for (const name of cacheNames) await caches.delete(name);
        window.location.reload(true);
      }
    });
  }
  const secretCard = document.querySelector('.game-card:nth-child(8) a');
  if (secretCard) {
    secretCard.addEventListener('click', (e) => {
      e.preventDefault();
      const cp = '13';
      const userInput = prompt('Bawal ka pa rito bantotie ka! >:((');
      if (userInput === cp) {
        window.location.href = secretCard.getAttribute('href');
      } else if (userInput !== null) {
        alert('Bantotie ka! >:((');
      }
    });
  }
});