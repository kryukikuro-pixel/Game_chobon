const screens = {
  menu: document.getElementById("menuScreen"),
  settings: document.getElementById("settingsScreen"),
  game: document.getElementById("gameScreen"),
  exit: document.getElementById("exitScreen")
};

function showScreen(name){
  Object.values(screens).forEach(el => el.classList.remove("active"));
  screens[name].classList.add("active");
}
document.getElementById("startBtn").addEventListener("click", () => showScreen("game"));
document.getElementById("settingsBtn").addEventListener("click", () => showScreen("settings"));
document.getElementById("exitBtn").addEventListener("click", () => showScreen("exit"));
document.querySelectorAll(".backMenuBtn").forEach(btn => btn.addEventListener("click", () => showScreen("menu")));

const snowRange = document.getElementById("snowRange");
const snowValue = document.getElementById("snowValue");
const grainToggle = document.getElementById("grainToggle");
const grain = document.getElementById("grainLayer");
const snowLayer = document.getElementById("snowLayer");

function createSnow(amount){
  snowLayer.innerHTML = "";
  for(let i = 0; i < amount; i++){
    const flake = document.createElement("div");
    flake.className = "snowflake";
    flake.style.left = Math.random() * 100 + "%";
    flake.style.animationDuration = (6 + Math.random() * 8) + "s";
    flake.style.animationDelay = (Math.random() * 6) + "s";
    flake.style.opacity = (0.15 + Math.random() * 0.6).toFixed(2);
    const size = 3 + Math.random() * 5;
    flake.style.width = size + "px";
    flake.style.height = size + "px";
    snowLayer.appendChild(flake);
  }
}
createSnow(60);
snowRange.addEventListener("input", (e) => {
  const value = Number(e.target.value);
  snowValue.textContent = value + "%";
  createSnow(value);
});
grainToggle.addEventListener("change", (e) => {
  grain.style.display = e.target.checked ? "block" : "none";
});

// ===== Game =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 30;
const MAP_W = 32;
const MAP_H = 18;

const defaultMap = Array.from({length: MAP_H}, (_, y) =>
  Array.from({length: MAP_W}, (_, x) => {
    if (y === MAP_H - 1) return 1;
    if (y === 13 && x > 1 && x < 10) return 1;
    if (y === 10 && x > 12 && x < 19) return 1;
    if (y === 7 && x > 22 && x < 28) return 1;
    if (y === 5 && x > 6 && x < 10) return 1;
    return 0;
  })
);
defaultMap[12][20] = 3;
defaultMap[9][24] = 3;
defaultMap[14][4] = 4;
defaultMap[15][26] = 4;
defaultMap[12][29] = 2;

function loadGameMap(){
  try {
    const saved = localStorage.getItem("sanabi_game_map");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  return defaultMap;
}

let map = loadGameMap();
const keys = {};
const player = {
  x: 3,
  y: 11,
  vx: 0,
  vy: 0,
  grounded: false,
  checkpoint: { x: 3, y: 11 }
};

const grapple = {
  active: false,
  target: null,
  length: 0
};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if ((e.key === "ArrowUp" || e.key === " ") && player.grounded) {
    player.vy = -1.05;
    player.grounded = false;
  }

  if (e.key.toLowerCase() === "r") {
    resetToCheckpoint();
  }

  if (e.key.toLowerCase() === "z") {
    if (grapple.active) {
      grapple.active = false;
      grapple.target = null;
    } else {
      const target = findNearestAnchor();
      if (target) {
        grapple.active = true;
        grapple.target = target;
        grapple.length = distance(centerX(), centerY(), target.x, target.y);
      }
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function centerX(){ return (player.x + 0.4) * TILE; }
function centerY(){ return (player.y + 0.48) * TILE; }

function distance(ax, ay, bx, by){
  return Math.hypot(ax - bx, ay - by);
}

function solidAt(x, y){
  if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) return true;
  return map[y][x] === 1;
}

function tileAt(x, y){
  if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) return 1;
  return map[y][x];
}

function findNearestAnchor(){
  let best = null;
  let bestDist = Infinity;
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      if (map[y][x] === 3) {
        const ax = x * TILE + TILE/2;
        const ay = y * TILE + TILE/2;
        const d = distance(centerX(), centerY(), ax, ay);
        if (d < 220 && d < bestDist) {
          bestDist = d;
          best = { x: ax, y: ay };
        }
      }
    }
  }
  return best;
}

function resetToCheckpoint(){
  player.x = player.checkpoint.x;
  player.y = player.checkpoint.y;
  player.vx = 0;
  player.vy = 0;
  grapple.active = false;
  grapple.target = null;
}

function update(){
  if (!screens.game.classList.contains("active")) return;

  let move = 0;
  if (keys["ArrowLeft"]) move -= 1;
  if (keys["ArrowRight"]) move += 1;

  player.vx = move * 0.22;
  player.vy += 0.055;

  if (grapple.active && grapple.target) {
    const px = centerX();
    const py = centerY();
    const dx = grapple.target.x - px;
    const dy = grapple.target.y - py;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const pull = 0.04;
    player.vx += (dx / dist) * pull;
    player.vy += (dy / dist) * pull;

    if (dist < 26) {
      grapple.active = false;
      grapple.target = null;
    }
  }

  let nx = player.x + player.vx;
  let ny = player.y + player.vy;
  let grounded = false;

  if (solidAt(Math.floor(nx), Math.floor(player.y)) || solidAt(Math.floor(nx + 0.8), Math.floor(player.y))) {
    nx = player.x;
  }

  if (solidAt(Math.floor(nx), Math.floor(ny + 0.95)) || solidAt(Math.floor(nx + 0.8), Math.floor(ny + 0.95))) {
    if (player.vy > 0) grounded = true;
    player.vy = 0;
    ny = Math.floor(ny + 0.95) - 1;
  }

  if (solidAt(Math.floor(nx), Math.floor(ny)) || solidAt(Math.floor(nx + 0.8), Math.floor(ny))) {
    if (player.vy < 0) player.vy = 0;
    ny = player.y;
  }

  player.x = nx;
  player.y = ny;
  player.grounded = grounded;

  const standingTile = tileAt(Math.floor(player.x + 0.4), Math.floor(player.y + 1));
  if (standingTile === 4) {
    player.checkpoint = { x: Math.floor(player.x), y: Math.floor(player.y) };
  }

  if (player.y > map.length + 3) {
    resetToCheckpoint();
  }
}

function drawBackground(){
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, "#121212");
  bgGrad.addColorStop(1, "#050505");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMap(){
  for(let y = 0; y < map.length; y++){
    for(let x = 0; x < map[0].length; x++){
      const tile = map[y][x];
      const px = x * TILE;
      const py = y * TILE;

      if (tile === 1) {
        ctx.fillStyle = "rgba(220,220,220,0.88)";
        ctx.fillRect(px, py, TILE, TILE);
      } else if (tile === 2) {
        ctx.fillStyle = "rgba(90,90,100,0.9)";
        ctx.fillRect(px, py, TILE, TILE);
      } else if (tile === 3) {
        ctx.fillStyle = "rgba(255,255,255,0.98)";
        ctx.beginPath();
        ctx.arc(px + TILE/2, py + TILE/2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === 4) {
        ctx.fillStyle = "rgba(170,170,180,0.9)";
        ctx.fillRect(px + 8, py + 4, 14, 22);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.strokeRect(px, py, TILE, TILE);
    }
  }
}

function drawPlayer(){
  if (grapple.active && grapple.target) {
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX(), centerY());
    ctx.lineTo(grapple.target.x, grapple.target.y);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.fillRect(player.x*TILE, player.y*TILE, TILE*0.8, TILE*0.95);
  ctx.shadowBlur = 0;
}

function drawHud(){
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = "15px Arial";
  ctx.fillText("← → 이동 / ↑ 점프 / Z 와이어 / R 리셋", 18, 28);
  ctx.fillText("개발자 페이지에서 적용한 맵이 있으면 자동 로드됨", 18, 50);
}

function draw(){
  drawBackground();
  drawMap();
  drawPlayer();
  drawHud();
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();