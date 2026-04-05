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

const MAP_W = 32;
const MAP_H = 18;
let selectedTile = 0;

function makeDefaultMap(){
  const grid = Array.from({length: MAP_H}, (_, y) =>
    Array.from({length: MAP_W}, (_, x) => {
      if (y === MAP_H - 1) return 1;
      if (y === 13 && x > 1 && x < 10) return 1;
      if (y === 10 && x > 12 && x < 19) return 1;
      if (y === 7 && x > 22 && x < 28) return 1;
      if (y === 5 && x > 6 && x < 10) return 1;
      return 0;
    })
  );
  grid[12][20] = 3;
  grid[9][24] = 3;
  grid[14][4] = 4;
  grid[15][26] = 4;
  grid[12][29] = 2;
  return grid;
}

let grid = makeDefaultMap();
const editorGrid = document.getElementById("editorGrid");
const output = document.getElementById("mapOutput");

function tileClass(value){
  if (value === 1) return "tile wall";
  if (value === 2) return "tile special";
  if (value === 3) return "tile anchor";
  if (value === 4) return "tile checkpoint";
  return "tile";
}

function renderGrid(){
  editorGrid.innerHTML = "";
  for(let y = 0; y < MAP_H; y++){
    for(let x = 0; x < MAP_W; x++){
      const btn = document.createElement("button");
      btn.className = tileClass(grid[y][x]);
      btn.title = `${x}, ${y}`;
      btn.addEventListener("click", () => {
        grid[y][x] = selectedTile;
        renderGrid();
      });
      editorGrid.appendChild(btn);
    }
  }
}

document.querySelectorAll(".tool-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    selectedTile = Number(btn.dataset.tile);
  });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  output.value = JSON.stringify(grid);
});

document.getElementById("saveBtn").addEventListener("click", () => {
  localStorage.setItem("sanabi_editor_map", JSON.stringify(grid));
  output.value = "브라우저 저장 완료";
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const saved = localStorage.getItem("sanabi_editor_map");
  if (!saved) {
    output.value = "저장된 맵이 없음";
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      grid = parsed;
      renderGrid();
      output.value = JSON.stringify(grid);
    }
  } catch (e) {
    output.value = "불러오기 실패";
  }
});

document.getElementById("applyBtn").addEventListener("click", () => {
  localStorage.setItem("sanabi_game_map", JSON.stringify(grid));
  output.value = "게임용 맵으로 적용 완료";
});

renderGrid();