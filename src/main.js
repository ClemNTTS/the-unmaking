import {
  CHUNK_SIZE,
  TILE_SIZE,
  VIEWPORT_WIDTH_HEIGHT,
  VISION_RADIUS,
} from "./constants.js";
import { Player } from "./player.js";
import { gameState } from "./state.js";
import { World } from "./world.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = VIEWPORT_WIDTH_HEIGHT;
canvas.height = VIEWPORT_WIDTH_HEIGHT;

const world = new World();
const player = new Player(world);
player.x = gameState.playerCoordinate[0];
player.y = gameState.playerCoordinate[1];

function update() {}

function drawTile(tileType, worldX, worldY, offsetX, offsetY, state) {
  if (tileType === 1) {
    ctx.fillStyle = "#fff";
  } else if (tileType === 3) {
    ctx.fillStyle = "#28d751";
  } else {
    ctx.fillStyle = "#734141";
  }

  if (state === "visited") {
    ctx.globalAlpha = 0.5;
  } else if (state === "visible") {
    ctx.globalAlpha = 1;
  }

  ctx.fillRect(
    worldX * TILE_SIZE + offsetX,
    worldY * TILE_SIZE + offsetY,
    TILE_SIZE,
    TILE_SIZE,
  );
}

function draw() {
  ctx.fillStyle = "#151123";

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

  const actualRadius = Math.sin(Date.now() * 0.002) + VISION_RADIUS;

  for (let cy = playerChunkY - 1; cy <= playerChunkY + 1; cy++) {
    for (let cx = playerChunkX - 1; cx <= playerChunkX + 1; cx++) {
      const chunk = world.getChunk(cx, cy);

      if (!chunk) continue;

      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const tileType = chunk.grid[y][x];

          const worldX = cx * CHUNK_SIZE + x;
          const worldY = cy * CHUNK_SIZE + y;

          const [px, py] = gameState.playerCoordinate;

          const dx = worldX - px;
          const dy = worldY - py;

          const distSq = dx * dx + dy * dy;
          const radius = actualRadius * actualRadius;

          if (distSq <= radius) {
            chunk.discoveredGrid[y][x] = true;
            drawTile(tileType, worldX, worldY, offsetX, offsetY, "visible");
          } else if (chunk.discoveredGrid[y][x]) {
            drawTile(tileType, worldX, worldY, offsetX, offsetY, "visited");
          }
        }
      }
    }
  }

  ctx.globalAlpha = 1;
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
