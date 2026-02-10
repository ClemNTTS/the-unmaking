import { CHUNK_SIZE, DIRECTIONS, TILE_SIZE } from "./constants.js";
import { gameState } from "./state.js";

export class Player {
  constructor(world) {
    this.x = gameState.playerCoordinate[0];
    this.y = gameState.playerCoordinate[1];
    this.tile = [0, 0];
    this.world = world;

    window.addEventListener("keydown", (e) => {
      let direction = "";

      if (
        e.key === "ArrowUp" &&
        this.canMove(this.world.getTileAt(this.x, this.y - 1))
      ) {
        this.y -= 1;
        direction = DIRECTIONS.north;
      } else if (
        e.key === "ArrowDown" &&
        this.canMove(this.world.getTileAt(this.x, this.y + 1))
      ) {
        this.y += 1;
        direction = DIRECTIONS.south;
      } else if (
        e.key === "ArrowLeft" &&
        this.canMove(this.world.getTileAt(this.x - 1, this.y))
      ) {
        this.x -= 1;
        direction = DIRECTIONS.west;
      } else if (
        e.key === "ArrowRight" &&
        this.canMove(this.world.getTileAt(this.x + 1, this.y))
      ) {
        this.x += 1;
        direction = DIRECTIONS.east;
      }

      gameState.playerCoordinate = [this.x, this.y];

      if (direction && this.world.getTileAt(this.x, this.y) === 3) {
        const nextChunkX = Math.floor((this.x + direction.x) / CHUNK_SIZE);
        const nextChunkY = Math.floor((this.y + direction.y) / CHUNK_SIZE);

        //si le chunk suivant existe déjà
        if (!this.world.getChunk(nextChunkX, nextChunkY)) {
          this.world.unlockPath(this.x, this.y, direction);
        }
      }
    });
  }

  update() {}

  canMove(tileValue) {
    const validTiles = [1, 3];
    return validTiles.includes(tileValue);
  }

  draw(ctx, offsetX, offsetY) {
    const worldX = this.x * TILE_SIZE;
    const worldY = this.y * TILE_SIZE;

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(worldX + offsetX, worldY + offsetY, TILE_SIZE, TILE_SIZE);
  }
}
