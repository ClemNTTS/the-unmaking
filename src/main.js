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
player.x = gameState.playerCoordinate[0];
player.y = gameState.playerCoordinate[1];

function update() {}

function drawTile(tileType, worldX, worldY, offsetX, offsetY) {
  if (tileType === 1) {
    ctx.fillStyle = "#fff";
  } else {
    ctx.fillStyle = "#330e7d";
  }

  ctx.fillRect(
    worldX * TILE_SIZE + offsetX,
    worldY * TILE_SIZE + offsetY,
    TILE_SIZE,
    TILE_SIZE,
  );
}

function draw() {
  ctx.fillStyle = "#000";

  const offsetX =
    VIEWPORT_WIDTH_HEIGHT / 2 -
    gameState.playerCoordinate[0] * TILE_SIZE -
    TILE_SIZE / 2;

  const offsetY =
    VIEWPORT_WIDTH_HEIGHT / 2 -
    gameState.playerCoordinate[1] * TILE_SIZE -
    TILE_SIZE / 2;

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const playerChunkX = Math.floor(gameState.playerCoordinate[0] / CHUNK_SIZE);
  const playerChunkY = Math.floor(gameState.playerCoordinate[1] / CHUNK_SIZE);

  const actualChunk = world.getChunk(playerChunkX, playerChunkY);

  if (!actualChunk) return;

  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      drawTile(actualChunk.grid[i][j], j, i, offsetX, offsetY);
    }
  }

  player.draw(ctx, offsetX, offsetY);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ==== EXPOSITION ==== */

/* ==================== */

gameLoop();
