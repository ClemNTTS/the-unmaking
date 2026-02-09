import { TILE_SIZE } from "./constants.js";

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
    });
  }

  update() {}

  draw() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}
