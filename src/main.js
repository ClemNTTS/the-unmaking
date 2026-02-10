import { CombatEngine } from "./combat.js";
import {
  BASE_TIMING,
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

const combatEngine = new CombatEngine();
const world = new World(combatEngine);
combatEngine.world = world;
const player = new Player(world);
player.x = gameState.playerCoordinate[0];
player.y = gameState.playerCoordinate[1];

function update() {
  combatEngine.update();
}

function drawTile(tileType, worldX, worldY, offsetX, offsetY, state) {
  if (tileType === 1) {
    ctx.fillStyle = "#fff";
  } else if (tileType === 3) {
    ctx.fillStyle = "#28d751";
  } else {
    ctx.fillStyle = "#734141";
  }

  if (state === "visited") {
    ctx.globalAlpha = 0.15;
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

function drawWorld() {
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

      chunk.entities.forEach((entity) => {
        if (entity.type === "rift") {
          ctx.fillStyle = "#ff00ff"; // Rose néon

          // Calcul de la position mondiale de l'entité
          const entWorldX = cx * CHUNK_SIZE + entity.x;
          const entWorldY = cy * CHUNK_SIZE + entity.y;

          // On ne dessine la faille que si elle est dans le champ de vision ou déjà découverte
          if (chunk.discoveredGrid[entity.y][entity.x]) {
            //On décide de l'alpha
            const [px, py] = gameState.playerCoordinate;
            const dx = entWorldX - px;
            const dy = entWorldY - py;
            const distSq = dx * dx + dy * dy;
            const radiusSq = actualRadius * actualRadius;

            if (distSq <= radiusSq) {
              ctx.globalAlpha = 1;
            } else {
              ctx.globalAlpha = 0.15;
            }

            ctx.fillRect(
              entWorldX * TILE_SIZE + offsetX,
              entWorldY * TILE_SIZE + offsetY,
              TILE_SIZE,
              TILE_SIZE,
            );
          }
        }
      });
    }
  }

  ctx.globalAlpha = 1;
  player.draw(ctx, offsetX, offsetY);
}

function drawTiming() {
  //fond allant de noir à rouge plus le timing est bas
  if (world.timing <= 0) {
    ctx.fillStyle = "#980a0a";
  } else {
    ctx.fillStyle = "#222";
  }
  ctx.fillRect(10, 10, BASE_TIMING * 20, 20);
  ctx.fillStyle = `rgb(${255 * (1 - world.timing / BASE_TIMING)}, 150, 0)`;
  ctx.fillRect(10, 10, world.timing * 20, 20);
}

function drawHUD() {
  // On récupère les éléments de remplissage (déjà créés dans le HTML)
  const hpFill = document.getElementById("hp-fill");
  const resFill = document.getElementById("res-fill");

  if (hpFill) hpFill.style.width = `${(gameState.hp / gameState.maxHp) * 100}%`;
  if (resFill) resFill.style.width = `${gameState.resolution}%`;
}

function draw() {
  if (gameState.mode === "exploration") {
    drawWorld();
  } else if (gameState.mode === "combat") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    combatEngine.draw(ctx);
  }

  drawHUD();
}

function gameLoop() {
  update();
  draw();
  drawTiming();
  requestAnimationFrame(gameLoop);
}

/* ==== EXPOSITION ==== */

/* ==================== */

gameLoop();
