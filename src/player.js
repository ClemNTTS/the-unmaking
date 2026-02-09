import { TILE_SIZE } from "./constants.js";
import { gameState } from "./state.js";

export class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.tile = [0, 0];

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") this.y -= 1;
      if (e.key === "ArrowDown") this.y += 1;
      if (e.key === "ArrowLeft") this.x -= 1;
      if (e.key === "ArrowRight") this.x += 1;

      gameState.playerCoordinate = [this.x, this.y];
    });
  }

  update() {}

  draw(ctx, offsetX, offsetY) {
    const worldX = this.x * TILE_SIZE;
    const worldY = this.y * TILE_SIZE;

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(worldX + offsetX, worldY + offsetY, TILE_SIZE, TILE_SIZE);
  }
}
