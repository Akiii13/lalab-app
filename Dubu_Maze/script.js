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
let canvas, ctx;
let rows, cols, cellSize;
let maze = [];
let player, goal;
let zoomFactor = 5;
const WALL_COLOR = "#058800ff";
const CORNER_RADIUS_FACTOR = 0.35;
const MOVE_SPEED = 0.15;
let gameFrozen = false;
let foundCount = 0;
let duduFrames = [], bubuFrames = [];
let duduIndex = 0, bubuIndex = 0;
let duduFrameTime = 0, bubuFrameTime = 0;
const FRAME_INTERVAL = 120;
function isOpen(x, y) {
  if (y < 0 || y >= rows || x < 0 || x >= cols) return false;
  return maze[y][x] === 0;
}
function roundedRectPath(ctx, x, y, w, h, rtl, rtr, rbr, rbl) {
  const maxR = Math.min(w, h) / 2;
  rtl = Math.min(rtl, maxR);
  rtr = Math.min(rtr, maxR);
  rbr = Math.min(rbr, maxR);
  rbl = Math.min(rbl, maxR);
  ctx.beginPath();
  ctx.moveTo(x + rtl, y);
  ctx.lineTo(x + w - rtr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rtr);
  ctx.lineTo(x + w, y + h - rbr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rbr, y + h);
  ctx.lineTo(x + rbl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rbl);
  ctx.lineTo(x, y + rtl);
  ctx.quadraticCurveTo(x, y, x + rtl, y);
}
function preloadPNGs() {
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `Characters/Dudu00${i}.png`;
    duduFrames.push(img);
  }
  for (let i = 1; i <= 9; i++) {
    const img = new Image();
    img.src = `Characters/Bubu00${i}.png`;
    bubuFrames.push(img);
  }
}
function generateMaze() {
  maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(x, y) {
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ].sort(() => Math.random() - 0.5);
    for (let [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < cols && ny > 0 && ny < rows && maze[ny][nx] === 1) {
        maze[ny][nx] = 0;
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }
  maze[1][1] = 0;
  carve(1, 1);
  player = { tx: 1, ty: 1, px: 1, py: 1 };
  let gx, gy, dist;
  do {
    gx = Math.floor(Math.random() * (cols - 2)) + 1;
    gy = Math.floor(Math.random() * (rows - 2)) + 1;
    dist = Math.abs(gx - player.tx) + Math.abs(gy - player.ty);
  } while (maze[gy][gx] !== 0 || dist < Math.floor(rows / 2));
  goal = { x: gx, y: gy };
}
function drawMaze(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.px += (player.tx - player.px) * MOVE_SPEED;
  player.py += (player.ty - player.py) * MOVE_SPEED;
  let camX = player.px - canvas.width / (cellSize * zoomFactor * 2);
  let camY = player.py - canvas.height / (cellSize * zoomFactor * 2);
  camX = Math.max(0, Math.min(cols - canvas.width / (cellSize * zoomFactor), camX));
  camY = Math.max(0, Math.min(rows - canvas.height / (cellSize * zoomFactor), camY));
  ctx.fillStyle = WALL_COLOR;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] !== 1) continue;
      const px = Math.floor((x - camX) * cellSize * zoomFactor);
      const py = Math.floor((y - camY) * cellSize * zoomFactor);
      const size = Math.ceil(cellSize * zoomFactor);
      const r = size * CORNER_RADIUS_FACTOR;
      const rtl = isOpen(x, y - 1) && isOpen(x - 1, y) ? r : 0;
      const rtr = isOpen(x, y - 1) && isOpen(x + 1, y) ? r : 0;
      const rbr = isOpen(x, y + 1) && isOpen(x + 1, y) ? r : 0;
      const rbl = isOpen(x, y + 1) && isOpen(x - 1, y) ? r : 0;
      if (rtl || rtr || rbr || rbl) {
        roundedRectPath(ctx, px, py, size, size, rtl, rtr, rbr, rbl);
        ctx.fill();
      } else {
        ctx.fillRect(px, py, size, size);
      }
    }
  }
  if (timestamp - bubuFrameTime > FRAME_INTERVAL) {
    bubuIndex = (bubuIndex + 1) % bubuFrames.length;
    bubuFrameTime = timestamp;
  }
  ctx.drawImage(
    bubuFrames[bubuIndex],
    Math.floor((goal.x - camX) * cellSize * zoomFactor),
    Math.floor((goal.y - camY) * cellSize * zoomFactor),
    Math.ceil(cellSize * zoomFactor),
    Math.ceil(cellSize * zoomFactor)
  );
  if (timestamp - duduFrameTime > FRAME_INTERVAL) {
    duduIndex = (duduIndex + 1) % duduFrames.length;
    duduFrameTime = timestamp;
  }
  ctx.drawImage(
    duduFrames[duduIndex],
    Math.floor((player.px - camX) * cellSize * zoomFactor),
    Math.floor((player.py - camY) * cellSize * zoomFactor),
    Math.ceil(cellSize * zoomFactor),
    Math.ceil(cellSize * zoomFactor)
  );
  requestAnimationFrame(drawMaze);
}
function movePlayer(dx, dy) {
  if (gameFrozen) return;
  const nx = player.tx + dx;
  const ny = player.ty + dy;
  if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
    if (nx === goal.x && ny === goal.y) {
      player.tx = nx;
      player.ty = ny;
      foundCount++;
      if (foundCount === 1) {
        showPopup("win-popup", ["giveup-btn", "again-btn"]);
      } else if (foundCount === 2) {
        showPopup("win-popup-2", ["next-btn"]);
      }
      gameFrozen = true;
      return;
    }
    if (maze[ny][nx] === 0) {
      player.tx = nx;
      player.ty = ny;
    }
  }
}
function startMaze() {
  canvas = document.getElementById("mazeCanvas");
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  if (window.innerWidth < 600) {
    rows = cols = 25;
    cellSize = 10;
    canvas.width = 300;
    canvas.height = 300;
  } else {
    rows = cols = 35;
    cellSize = 12;
    canvas.width = 400;
    canvas.height = 400;
  }
  canvas.style.display = "block";
  generateMaze();
  drawMaze();
}
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  if (e.key === "ArrowDown") movePlayer(0, 1);
  if (e.key === "ArrowLeft") movePlayer(-1, 0);
  if (e.key === "ArrowRight") movePlayer(1, 0);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});
function setupMobileControls() {
  const controls = document.getElementById("mobile-controls");
  controls.classList.remove("hidden");
  document.querySelectorAll(".arrow-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.getAttribute("data-dir");
      if (dir === "up") movePlayer(0, -1);
      if (dir === "down") movePlayer(0, 1);
      if (dir === "left") movePlayer(-1, 0);
      if (dir === "right") movePlayer(1, 0);
    });
  });
}
function launchGame() {
  preloadPNGs();
  startMaze();
  if (window.innerWidth < 600) {
    setupMobileControls();
  }
}
let giveUpStates = ["Give Up", "Are you sure?", "No"];
let giveUpIndex = 0;
function lockButtonTemporarily(btnId, delay = 2000) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }, delay);
}
function showPopup(popupId, buttonIds = []) {
  const popup = document.getElementById(popupId);
  if (!popup) return;
  popup.classList.remove("hidden");
  buttonIds.forEach(id => lockButtonTemporarily(id));
}
document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play-btn");
  const introScreen = document.getElementById("intro-screen");
  if (playBtn && introScreen) {
    playBtn.addEventListener("click", () => {
      introScreen.style.display = "none";
      launchGame();
    });
  }
  const giveupBtn = document.getElementById("giveup-btn");
  const againBtn = document.getElementById("again-btn");
  if (giveupBtn) {
    giveupBtn.addEventListener("click", () => {
      giveUpIndex = (giveUpIndex + 1) % giveUpStates.length;
      giveupBtn.textContent = giveUpStates[giveUpIndex];
    });
  }
  if (againBtn) {
    againBtn.addEventListener("click", () => {
      let gx, gy;
      do {
        gx = Math.floor(Math.random() * (cols - 2)) + 1;
        gy = Math.floor(Math.random() * (rows - 2)) + 1;
      } while (maze[gy][gx] !== 0 || (gx === player.tx && gy === player.ty));
      goal = { x: gx, y: gy };
      document.getElementById("win-popup").classList.add("hidden");
      gameFrozen = false;
    });
  }
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      document.getElementById("win-popup-2").classList.add("hidden");
      showPopup("assurance-popup", ["resolution-btn"]);
    });
  }
  const resolutionBtn = document.getElementById("resolution-btn");
  if (resolutionBtn) {
    resolutionBtn.addEventListener("click", () => {
      document.getElementById("assurance-popup").classList.add("hidden");
      showPopup("resolution-popup", ["end-btn"]);
    });
  }
  const endBtn = document.getElementById("end-btn");
  if (endBtn) {
    endBtn.addEventListener("click", () => {
      document.getElementById("resolution-popup").classList.add("hidden");
      document.getElementById("intro-screen").style.display = "flex";
      canvas.style.display = "none";
      foundCount = 0;
      gameFrozen = false;
    });
  }
});