/*
Week 4 — Example 3 Extension: Smoother Movement & UI
*/

// ----------------------------
// Globals
// ----------------------------

let levelsData;
let levels = [];
let current = 0;
let displayLevel = 1;

const TS = 32; // Tile Size
const UI_TOP = 40; // Top bar height
const UI_BOTTOM = 40; // Bottom bar height

let player = {
  x: 0,
  y: 0,
  size: 26, // Visual size
  speed: 3,
};

let goal = { c: 0, r: 0 };

// ----------------------------
// Preload
// ----------------------------
function preload() {
  levelsData = loadJSON("levels.json");
}

// ----------------------------
// Level Class
// ----------------------------
class Level {
  constructor(grid, tileSize) {
    this.grid = grid;
    this.ts = tileSize;
  }

  cols() {
    return this.grid[0].length;
  }
  rows() {
    return this.grid.length;
  }

  pixelWidth() {
    return this.cols() * this.ts;
  }
  pixelHeight() {
    return this.rows() * this.ts;
  }

  isWall(c, r) {
    if (c < 0 || r < 0 || c >= this.cols() || r >= this.rows()) return true;
    return this.grid[r][c] === 1;
  }

  draw() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const v = this.grid[r][c];
        noStroke();
        fill(v === 1 ? color(30, 50, 60) : color(220));
        rect(c * this.ts, r * this.ts, this.ts, this.ts);
      }
    }
  }
}

// ----------------------------
// Setup
// ----------------------------
function setup() {
  levels = levelsData.levels.map((grid) => new Level(grid, TS));
  resetLevel();
  noStroke();
  textAlign(CENTER, CENTER);
}

// ----------------------------
// Game Logic
// ----------------------------
function resetLevel() {
  let lvl = levels[current];

  resizeCanvas(lvl.pixelWidth(), lvl.pixelHeight() + UI_TOP + UI_BOTTOM);

  let validSpots = [];
  for (let r = 0; r < lvl.rows(); r++) {
    for (let c = 0; c < lvl.cols(); c++) {
      if (!lvl.isWall(c, r)) {
        validSpots.push({ c, r });
      }
    }
  }

  let goalSpot = random(validSpots);
  goal.c = goalSpot.c;
  goal.r = goalSpot.r;

  let playerSpot = random(validSpots);
  while (
    playerSpot.c === goal.c &&
    playerSpot.r === goal.r &&
    validSpots.length > 1
  ) {
    playerSpot = random(validSpots);
  }

  player.x = playerSpot.c * TS + TS / 2;
  player.y = playerSpot.r * TS + TS / 2;
}

// ----------------------------
// Draw Loop
// ----------------------------
function draw() {
  background(255);

  // 1. Top Header
  fill(30);
  rect(0, 0, width, UI_TOP);
  fill(255);
  textSize(18);
  text("LEVEL " + displayLevel, width / 2, UI_TOP / 2);

  // 2. Game Area
  push();
  translate(0, UI_TOP);

  let lvl = levels[current];
  lvl.draw();

  // Goal
  fill(200, 50, 50);
  rect(goal.c * TS, goal.r * TS, TS, TS);

  // Player
  handleInput(lvl);
  fill(50, 200, 50);
  circle(player.x, player.y, player.size);

  // Win Check
  let goalPixelX = goal.c * TS + TS / 2;
  let goalPixelY = goal.r * TS + TS / 2;
  if (dist(player.x, player.y, goalPixelX, goalPixelY) < TS / 2) {
    levelComplete();
  }

  pop();

  // 3. Bottom Footer
  fill(30);
  rect(0, height - UI_BOTTOM, width, UI_BOTTOM);
  fill(200);
  textSize(12);
  text("Controls: WASD or Arrow Keys", width / 2, height - UI_BOTTOM / 2);
}

// ----------------------------
// Movement & Collision
// ----------------------------
function handleInput(lvl) {
  // Move X
  let nextX = player.x;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) nextX -= player.speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) nextX += player.speed;

  if (!checkCollision(nextX, player.y, lvl)) {
    player.x = nextX;
  }

  // Move Y
  let nextY = player.y;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) nextY -= player.speed;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) nextY += player.speed;

  if (!checkCollision(player.x, nextY, lvl)) {
    player.y = nextY;
  }
}

function checkCollision(x, y, lvl) {
  // COLLISION FIX:
  // We subtract a small "padding" from the radius for collision checks only.
  // This makes the physics body slightly smaller than the visual circle.
  // It ensures that if we are visually "touching" a wall, we aren't
  // mathematically "inside" it, allowing us to slide freely.

  const hitBoxPadding = 3;
  let r = player.size / 2 - hitBoxPadding;

  let pointsToCheck = [
    { x: x - r, y: y - r },
    { x: x + r, y: y - r },
    { x: x + r, y: y + r },
    { x: x - r, y: y + r },
  ];

  for (let p of pointsToCheck) {
    let c = floor(p.x / TS);
    let row = floor(p.y / TS);
    if (lvl.isWall(c, row)) return true;
  }
  return false;
}

// ----------------------------
// Win State
// ----------------------------
function levelComplete() {
  current++;
  displayLevel++;

  if (current >= levels.length) {
    current = 0;
  }

  resetLevel();
}
