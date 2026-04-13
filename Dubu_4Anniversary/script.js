/* ─── Utility helpers ─── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelector(sel);
const setStyles = (el, styles) => el && Object.assign(el.style, styles);

const [exitBtn, music, envSound, loadingScreen, progressFill, progressIcon] =
  ['exit-btn', 'bg-music', 'envelope-sound', 'loading-screen', 'progress-fill', 'progress-icon'].map($);

const tapText = $$('.tap-text');
const progressWrapper = $$('.progress-wrapper');

/* ─── Scroll prevention ─── */
const preventScroll = e => e.preventDefault();
const disableScroll = () => document.addEventListener('touchmove', preventScroll, { passive: false });
const enableScroll = () => document.removeEventListener('touchmove', preventScroll, { passive: false });

/* ─── Exit game ─── */
function exitGame() {
  enableScroll();
  sessionStorage.removeItem('anniversary');
  location.href = '../index.html';
}

/* ─── Envelope sound effect ─── */
function playEnvelopeSound(delayMs = 0) {
  if (!envSound) return;
  const play = () => { envSound.currentTime = 0; envSound.play().catch(() => { }); };
  delayMs > 0 ? setTimeout(play, delayMs) : play();
}

/* ─── Background music ─── */
function tryPlayMusic() {
  music && setTimeout(() => music.play().catch(() => { }), 500);
}

function armMusicOnInteraction() {
  const start = () => {
    music && setTimeout(() => music.play().catch(() => { }), 5000);
    localStorage.setItem('musicConfirmed', 'yes');
  };
  document.addEventListener('click', start, { once: true });
  document.addEventListener('touchstart', start, { once: true });
}

/* ─── Confetti burst on envelope open ─── */
function burstConfetti() {
  const container = $('heartsBg');
  if (!container) return;
  const icons = [
    'icons/confetti-duotone.svg',
    'icons/star-duotone.svg',
    'icons/guitar-svgrepo-com.svg',
  ];
  for (let i = 0; i < 18; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'float-heart';
    const img = document.createElement('img');
    img.src = icons[Math.floor(Math.random() * icons.length)];
    const size = 12 + Math.random() * 18;
    img.style.cssText = `width:${size}px;height:${size}px;opacity:.8;
      filter:invert(35%) sepia(50%) saturate(600%) hue-rotate(15deg) brightness(70%);`;
    wrap.appendChild(img);
    wrap.style.left = (30 + Math.random() * 40) + 'vw';
    wrap.style.bottom = '40vh';
    const dur = 2 + Math.random() * 2;
    wrap.style.animationDuration = dur + 's';
    wrap.style.animationDelay = (Math.random() * 0.4) + 's';
    container.appendChild(wrap);
    setTimeout(() => wrap.remove(), (dur + 1) * 1000);
  }
}

/* ─── Floating icon particles ─── */
function spawnHearts() {
  const container = $('heartsBg');
  if (!container) return;
  const icons = [
    'icons/heart-duotone.svg',
    'icons/autumn-leaf-svgrepo-com.svg',
    'icons/star-duotone.svg',
    'icons/flower-svgrepo-com.svg',
    'icons/feather-quill-bird-write-svgrepo-com.svg',
    'icons/music-note-duotone.svg',
    'icons/guitar-svgrepo-com.svg',
  ];
  setInterval(() => {
    const wrap = document.createElement('div');
    wrap.className = 'float-heart';
    const img = document.createElement('img');
    img.src = icons[Math.floor(Math.random() * icons.length)];
    const size = 14 + Math.random() * 16;
    img.style.cssText = `width:${size}px;height:${size}px;opacity:.55;
      filter:invert(38%) sepia(60%) saturate(800%) hue-rotate(15deg) brightness(75%) contrast(90%);`;
    wrap.appendChild(img);
    wrap.style.left = Math.random() * 100 + 'vw';
    const dur = 7 + Math.random() * 8;
    wrap.style.animationDuration = dur + 's';
    wrap.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(wrap);
    setTimeout(() => wrap.remove(), (dur + 3) * 1000);
  }, 900);
}

/* ─── Launch ─── */
function launchGame() {
  $('game-container')?.classList.remove('hidden');
  spawnHearts();
  disableScroll();
  envelopeReady = false;
  setTimeout(() => {
    envelopeReady = true;
    $('envelope-wrap')?.classList.add('ready');
  }, 4400);
}


/* ══════════════════════════════════════════════════════
   Z-INDEX SANDWICH
   z:10  #game-container
   z:25  #memory-container
   z:30  #env-front-overlay
══════════════════════════════════════════════════════ */
let envelopeOpened = false;
let envelopeReady = false;
let dockedTransformY = 0;
let musicStopTimer = null;

const SCALE = 1.7;
const SHOW_FRAC = 0.26;
const V_FRAC = 0.50;


/* ─── Front overlay ─── */
function createFrontOverlay(env) {
  $('env-front-overlay')?.remove();

  const cssW = env.offsetWidth;
  const rect = env.getBoundingClientRect();
  const sc = rect.width / cssW;
  const overlay = env.cloneNode(true);
  overlay.id = 'env-front-overlay';

  overlay.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top:  ${rect.top}px;
    width:  ${cssW}px;
    height: ${env.offsetHeight}px;
    transform-origin: top left;
    transform: scale(${sc});
    z-index: 30;
    pointer-events: none;
    cursor: default;
    animation: none;
    transition: none;
    filter: drop-shadow(0 8px 22px rgba(0,0,0,.13))
            drop-shadow(0 24px 48px rgba(0,0,0,.09));
  `;

  const vPct = (V_FRAC * 100).toFixed(2);
  overlay.style.clipPath =
    `polygon(0% 0%, 50% ${vPct}%, 100% 0%, 100% 100%, 0% 100%)`;

  overlay.querySelector('.env-flap')?.remove();
  overlay.querySelector('.env-seal')?.remove();
  overlay.removeAttribute('onclick');
  overlay.style.cursor = 'default';

  document.body.appendChild(overlay);
}

function removeFrontOverlay() { $('env-front-overlay')?.remove(); }


/* ─── openEnvelope ─── */
function openEnvelope() {
  if (!envelopeReady || envelopeOpened) return;
  envelopeOpened = true;
  burstConfetti();

  if (musicStopTimer) { clearInterval(musicStopTimer); musicStopTimer = null; }
  if (music && music.paused) {
    setTimeout(() => { music.volume = 1; music.play().catch(() => { }); }, 500);
  }

  const wrap = $('envelope-wrap');
  const env = $('envelope');
  const flap = $('envFlap');
  const seal = $('envSeal');
  const memCont = $('memory-container');

  /* ── 1. Dock to bottom ── */
  if (wrap) {
    wrap.style.animation = 'none';
    wrap.offsetHeight;
    wrap.classList.add('open-docked');
    wrap.offsetHeight;
    const envH = env?.offsetHeight ?? 196;
    const dockY = (window.innerHeight / 2) - (envH * SCALE * SHOW_FRAC);
    dockedTransformY = dockY;
    wrap.style.transform = `translateY(${dockY}px) scale(${SCALE})`;
  }

  /* ── 2. Open flap + hide seal + sound (t = 500ms) ── */
  setTimeout(() => {
    if (seal) {
      seal.classList.add('hide');
      seal.addEventListener('transitionend', () => {
        seal.style.display = 'none';
      }, { once: true });
    }
    flap?.classList.add('open');
    playEnvelopeSound();
  }, 500);

  /* ── 3. Reveal memory scroll (t = 1350ms) ── */
  setTimeout(() => {
    if (!memCont || !env) return;

    const rect = env.getBoundingClientRect();
    const vTipX = rect.left + rect.width / 2;
    const mouthY = rect.top + rect.height * V_FRAC;

    createFrontOverlay(env);

    const pts = [
      `0px 0px`,
      `${window.innerWidth}px 0px`,
      `${window.innerWidth}px ${rect.top}px`,
      `${rect.right}px ${rect.top}px`,
      `${vTipX}px ${mouthY}px`,
      `${rect.left}px ${rect.top}px`,
      `0px ${rect.top}px`,
      `0px 0px`
    ].join(', ');

    Object.assign(memCont.style, {
      top: '0', left: '0', right: '0', bottom: '0',
      height: 'auto', clipPath: `polygon(${pts})`
    });

    memCont.classList.remove('hidden');
    memCont.classList.add('show');

    initMemoryScroll({ mouthY });
  }, 1350);
}


/* ══════════════════════════════════════════════════════
   MEMORY SCROLL
══════════════════════════════════════════════════════ */
function initMemoryScroll({ mouthY }) {
  const scroll = $('memory-scroll');
  if (!scroll) return;

  const startY = mouthY + 4;
  const PX_PER_SEC = 44;
  let rafId = null, paused = false, pos = 0, lastTs = null;

  scroll.style.transition = 'none';
  scroll.style.transform = `translateY(${startY}px)`;
  scroll.offsetHeight;

  const totalDist = startY + scroll.scrollHeight;

  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;
    if (!paused) {
      pos += (delta / 1000) * PX_PER_SEC;
      if (pos >= totalDist) { cancelAnimationFrame(rafId); closeMemory(); return; }
      scroll.style.transform = `translateY(${startY - pos}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  scroll.addEventListener('touchstart', () => { paused = true; lastTs = null; }, { passive: true });
  scroll.addEventListener('touchend', () => { setTimeout(() => { paused = false; lastTs = null; }, 1200); }, { passive: true });
  scroll._stop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };
}

/* ══════════════════════════════════════════════════════
   CLOSE MEMORY
══════════════════════════════════════════════════════ */
function closeMemory() {
  const memCont = $('memory-container');
  const scroll = $('memory-scroll');
  const wrap = $('envelope-wrap');
  const flap = $('envFlap');
  const seal = $('envSeal');

  envelopeReady = false;
  wrap?.classList.remove('ready');
  setTimeout(() => {
    envelopeReady = true;
    wrap?.classList.add('ready');
  }, 6200);

  if (music) {
    music.volume = isNaN(music.volume) ? 1 : music.volume;
    musicStopTimer = setInterval(() => {
      if (music.volume > 0.1) {
        music.volume = Math.max(0, music.volume - 0.1);
      } else {
        music.volume = 0;
        music.pause();
        music.currentTime = 0;
        clearInterval(musicStopTimer);
        musicStopTimer = null;
      }
    }, 30);
  }

  scroll?._stop?.();

  setStyles(memCont, { transition: 'opacity .4s ease', opacity: '0' });

  setTimeout(() => {
    removeFrontOverlay();

    if (memCont) {
      memCont.classList.add('hidden');
      memCont.classList.remove('show');
      setStyles(memCont, {
        opacity: '', transition: '',
        top: '', left: '', right: '', bottom: '', height: '', clipPath: ''
      });
    }
    if (scroll) { scroll.style.transform = 'translateY(0)'; scroll._stop = null; }

    envelopeOpened = false;

    flap?.classList.remove('open');
    playEnvelopeSound();

    setTimeout(() => {
      if (!wrap) return;

      wrap.style.animation = 'none';
      wrap.classList.remove('open-docked');
      wrap.offsetHeight;

      wrap.style.transition = 'transform 0.7s cubic-bezier(.25,.8,.2,1)';
      wrap.style.transform = 'translateX(0) translateY(0) scale(1)';
      wrap.style.opacity = '1';

      setTimeout(() => {
        wrap.style.transition = 'none';
        wrap.style.animation = 'slingshotExit 0.95s cubic-bezier(.55,0,.85,.3) forwards';

        setTimeout(() => {
          if (!wrap) return;

          // Restore seal only after envelope is fully off-screen
          if (seal) {
            seal.style.transition = 'none';
            seal.style.display = '';
            seal.classList.remove('hide');
            seal.offsetHeight;
            seal.style.transition = '';
          }

          wrap.style.cssText = '';
          wrap.offsetHeight;
          wrap.style.animation = 'none';
          wrap.offsetHeight;
          wrap.style.animation = '';
        }, 950);
      }, 750);

    }, 880);

  }, 450);
}


/* ══════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const alreadyLoaded = sessionStorage.getItem('anniversary');
  const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

  const animateProgress = () => {
    if (!progressIcon || !progressWrapper) return;
    const iconWidth = progressIcon.offsetWidth;
    const barWidth = progressWrapper.clientWidth;
    const maxLeft = barWidth - iconWidth + 22;
    const duration = 3000;
    const start = performance.now();

    const step = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = easeInOutSine(t);
      progressIcon.style.left = maxLeft * eased + 'px';
      progressFill.style.width = ((maxLeft * eased + iconWidth / 2) / barWidth * 100) + '%';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        progressFill.style.width = '100%';
        progressIcon.style.left = maxLeft + 'px';
        setTimeout(() => {
          tapText?.classList.add('show');
          setTimeout(() => { tapText?.classList.add('loop'); enableTap(); }, 800);
        }, 300);
      }
    };
    requestAnimationFrame(step);
  };

  function enableTap() {
    const handler = e => {
      e.preventDefault();
      e.stopPropagation();
      loadingScreen?.classList.add('exit');
      setTimeout(() => {
        if (loadingScreen) loadingScreen.style.display = 'none';
        document.body.style.overflow = '';
        sessionStorage.setItem('anniversary', 'true');
        exitBtn?.classList.remove('hidden');
        launchGame();
      }, 600);
      ['click', 'touchstart'].forEach(evt =>
        window.removeEventListener(evt, handler, { passive: false }));
    };
    ['click', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, handler, { passive: false }));
  }

  if (!alreadyLoaded && loadingScreen && tapText) {
    document.body.style.overflow = 'hidden';
    progressIcon.style.opacity = '1';
    animateProgress();
  } else {
    if (loadingScreen) loadingScreen.style.display = 'none';
    exitBtn?.classList.remove('hidden');
    disableScroll();
    launchGame();
  }
});