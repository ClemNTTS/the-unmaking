import { CHUNK_SIZE, TILE_SIZE, VIEWPORT_WIDTH_HEIGHT } from "./constants.js";
import { Player } from "./player.js";
import { gameState } from "./state.js";
import { World } from "./world.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = VIEWPORT_WIDTH_HEIGHT;
canvas.height = VIEWPORT_WIDTH_HEIGHT;

const world = new World();
const player = new Player();

function update() {}

function drawTile(tileType, x, y) {
  if (tileType === 1) {
    ctx.fillStyle = "#fff";
  } else {
    ctx.fillStyle = "#330e7d";
  }

  ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function draw() {
  ctx.fillStyle = "#000";

  const playerChunkX = Math.floor(gameState.playerCoordinate[0] / CHUNK_SIZE);
  const playerChunkY = Math.floor(gameState.playerCoordinate[1] / CHUNK_SIZE);

  const actualChunk = world.getChunk(playerChunkX, playerChunkY);

  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      drawTile(actualChunk.grid[j][i], j, i);
    }
  }

  player.draw();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ==== EXPOSITION ==== */

/* ==================== */

gameLoop();
