import { CHUNK_SIZE } from "./constants.js";

export class World {
  constructor() {
    this.chunks = new Map();
    this.timing = 10;

    this.generateInitialChunk();
  }

  getChunk(cx, cy) {
    return this.chunks.get(`${cx},${cy}`);
  }

  createChunk(cx, cy) {
    const grid = Array.from({ length: CHUNK_SIZE }, () => {
      return new Array(CHUNK_SIZE).fill(0);
    });

    return {
      x: cx,
      y: cy,
      grid: grid,
      isStabilized: true,
      exits: { north: false, south: false, east: false, west: false },
    };
  }

  applyBasicPath(chunk) {
    if (!chunk || !chunk.grid) return;

    // Exemple : Créer une zone de 4x4 au centre du chunk
    const center = Math.floor(CHUNK_SIZE / 2);

    for (let i = -2; i <= 1; i++) {
      for (let j = -2; j <= 1; j++) {
        chunk.grid[center + i][center + j] = 1; // 1 = Sol
      }
    }
  }

  generateInitialChunk() {
    const startChunk = this.createChunk(0, 0);
    this.applyBasicPath(startChunk);
    this.chunks.set("0,0", startChunk);
  }

  unlockPath(currentX, currentY, direction) {
    // 1. Vérifier si on a assez de timing
    // 2. Calculer les coordonnées du nouveau chunk (ex: Nord = cy + 1)
    // 3. Créer le nouveau chunk et le relier au précédent
  }
}
