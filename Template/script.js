const $ = id => document.getElementById(id);
const $$ = sel => document.querySelector(sel);
const setStyles = (el, styles) => Object.assign(el.style, styles);
const [
  exitBtn, music, loadingScreen, progressFill, progressIcon
] = [
  'exit-btn','bg-music','loading-screen','progress-fill','progress-icon'
].map($);
const tapText = $$('.tap-text');
const progressWrapper = $$('.progress-wrapper');
function preventScroll(e) { e.preventDefault(); }
function disableScroll() { document.addEventListener('touchmove', preventScroll, { passive: false }); }
function enableScroll() { document.removeEventListener('touchmove', preventScroll, { passive: false }); }
if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    enableScroll();
    sessionStorage.removeItem('photobooth');
    location.href = "../index.html";
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const hasConfirmed = localStorage.getItem('musicConfirmed');
  const alreadyLoaded = sessionStorage.getItem('maze');
  const tryPlayMusic = () => music && music.paused && music.play().catch(()=>{});
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
          if (tapText) tapText.classList.add('show');
          setTimeout(() => {
            if (tapText) tapText.classList.add('loop');
            enableTap();
          }, 800);
        }, 300);
      }
    };
    requestAnimationFrame(step);
  };
  function enableTap() {
    const handler = e => {
      e.preventDefault();
      e.stopPropagation();
      if (loadingScreen) loadingScreen.classList.add('exit');
      setTimeout(() => {
        if (loadingScreen) loadingScreen.style.display = 'none';
        document.body.style.overflow = '';
        sessionStorage.setItem('maze', 'true');
        tryPlayMusic();
        localStorage.setItem('musicConfirmed', 'yes');
        if (exitBtn) exitBtn.classList.remove('hidden');
        disableScroll();
        launchGame();
      }, 600);
      ['click','touchstart'].forEach(evt => window.removeEventListener(evt, handler, { passive: false }));
    };
    ['click','touchstart'].forEach(evt => window.addEventListener(evt, handler, { passive: false }));
  }
  if (!alreadyLoaded && loadingScreen && tapText) {
    document.body.style.overflow = 'hidden';
    progressIcon.style.opacity = '1';
    animateProgress();
  } else {
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (exitBtn) exitBtn.classList.remove('hidden');
    disableScroll();
    const enableMusic = () => {
      tryPlayMusic();
      localStorage.setItem('musicConfirmed', 'yes');
      ['click','touchstart'].forEach(evt => window.removeEventListener(evt, enableMusic));
    };
    if (!hasConfirmed) {
      ['click','touchstart'].forEach(evt => window.addEventListener(evt, enableMusic, { once:true }));
    } else {
      tryPlayMusic();
    }
    launchGame();
  }
});