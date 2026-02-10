import { BASE_TIMING, CHUNK_SIZE, DIRECTIONS } from "./constants.js";
import { createRandomPartition } from "./partitions.js";

export class World {
  constructor(combatEngine) {
    this.chunks = new Map();
    this.timing = BASE_TIMING;
    this.combatEngine = combatEngine;
    this.generateInitialChunk();
  }

  getChunk(cx, cy) {
    return this.chunks.get(`${cx},${cy}`);
  }

  createChunk(cx, cy, enter, exits = [], visualDoors = []) {
    const grid = Array.from({ length: CHUNK_SIZE }, () => {
      return new Array(CHUNK_SIZE).fill(0);
    });

    const discoveredGrid = Array.from({ length: CHUNK_SIZE }, () => {
      return new Array(CHUNK_SIZE).fill(false);
    });

    this.drunkenWalk(enter.x, enter.y, grid, exits, visualDoors);

    const entities = [];
    const floorTiles = [];

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        if (grid[y][x] === 1 && (x !== enter.x || y !== enter.y)) {
          floorTiles.push({ x, y });
        }
      }
    }

    if (floorTiles.length > 0 && Math.random() > 0.33) {
      const pos = floorTiles[Math.floor(Math.random() * floorTiles.length)];
      const partition = createRandomPartition();
      entities.push({ x: pos.x, y: pos.y, type: "rift", partition: partition });
    }

    return {
      x: cx,
      y: cy,
      grid: grid,
      entities: entities,
      discoveredGrid: discoveredGrid,
      isStabilized: true,
      exits: { north: false, south: false, east: false, west: false },
    };
  }

  removeEntityAt(x, y) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cy = Math.floor(y / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cy);

    if (!chunk) return;

    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk.entities = chunk.entities.filter(
      (e) => e.x !== localX || e.y !== localY,
    );
  }

  drunkenWalk(startX, startY, grid, ends, visualDoors = []) {
    function allEndsReacheds(ends, grid) {
      for (const end of ends) {
        if (grid[end.y][end.x] !== 1) {
          return false;
        }
      }

      return true;
    }

    function isEnd(x, y, ends) {
      for (const end of ends) {
        if (end.x === x && end.y === y) {
          return true;
        }
      }

      return false;
    }

    function transformDoors(ends, grid) {
      for (const end of ends) {
        grid[end.y][end.x] = 3;
      }
    }

    let x = startX;
    let y = startY;

    while (!allEndsReacheds(ends, grid)) {
      const direction = Math.floor(Math.random() * 4);
      switch (direction) {
        case 0:
          if (y > 1 || isEnd(x, y - 1, ends)) y--;
          break;
        case 1:
          if (y < CHUNK_SIZE - 2 || isEnd(x, y + 1, ends)) y++;
          break;
        case 2:
          if (x > 1 || isEnd(x - 1, y, ends)) x--;
          break;
        case 3:
          if (x < CHUNK_SIZE - 2 || isEnd(x + 1, y, ends)) x++;
          break;
      }

      grid[y][x] = 1;

      if (isEnd(x, y, ends)) {
        x = startX;
        y = startY;
      }
    }

    transformDoors(visualDoors, grid);
  }

  generateInitialChunk() {
    const initialDoors = [
      { x: 8, y: 0 },
      { x: 8, y: 15 },
      { x: 0, y: 8 },
      { x: 15, y: 8 },
    ];
    const startChunk = this.createChunk(
      0,
      0,
      { x: 8, y: 8 },
      initialDoors,
      initialDoors,
    );

    this.chunks.set("0,0", startChunk);
  }

  unlockPath(currentX, currentY, direction) {
    if (this.timing <= 0) return;

    // Calcul des coordonnées du nouveau chunk
    const newChunkX = Math.floor((currentX + direction.x) / CHUNK_SIZE);
    const newChunkY = Math.floor((currentY + direction.y) / CHUNK_SIZE);

    // Sécurité : On arrête tout si le chunk existe déjà
    if (this.chunks.has(`${newChunkX},${newChunkY}`)) return;

    this.timing--;

    // 1. STABILISATION : L'ancienne porte devient du sol (Type 1)
    const currentChunk = this.getChunk(
      Math.floor(currentX / CHUNK_SIZE),
      Math.floor(currentY / CHUNK_SIZE),
    );
    // Calcul précis des coordonnées locales (gestion des négatifs incluse)
    const localX = ((currentX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((currentY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    currentChunk.grid[localY][localX] = 1;

    // 2. PRÉPARATION : L'entrée dans le nouveau monde
    const entryPoint = direction.entry;
    const allTargets = [entryPoint]; // L'ivrogne doit passer par là
    const visualDoors = []; // Ce qui sera vert à la fin

    // 3. SCAN DU VOISINAGE (Logique Vectorielle Robuste)
    for (const [key, dir] of Object.entries(DIRECTIONS)) {
      // MATHS : Si ce vecteur est l'opposé de notre direction d'arrivée, c'est l'entrée.
      // Ex: On va au Nord (0, -1). L'opposé est (0, 1). Si dir est (0, 1), c'est l'entrée.
      const isEntry = dir.x === -direction.x && dir.y === -direction.y;

      if (isEntry) {
        // C'est notre point d'entrée : on ne l'ajoute PAS aux visualDoors (donc il restera blanc/sol)
        continue;
      }

      const exitPoint = DIRECTIONS[dir.opp].entry;

      const nx = newChunkX + dir.x;
      const ny = newChunkY + dir.y;
      const neighbor = this.getChunk(nx, ny);

      if (neighbor) {
        // Le voisin existe : on vérifie s'il a une porte TENDUE vers nous
        const neighborEdge = dir.entry;

        const tileType = neighbor.grid[neighborEdge.y][neighborEdge.x];

        if (tileType === 3 || tileType === 1) {
          allTargets.push(exitPoint);

          if (tileType === 3) {
            neighbor.grid[neighborEdge.y][neighborEdge.x] = 1;
          }
        }
        // NON (Mur) : On ne fait rien. La porte est interdite.
      } else {
        // Le voisin n'existe pas : Chance d'ouvrir une porte vers l'inconnu
        if (Math.random() > 0.5) {
          allTargets.push(exitPoint);
          visualDoors.push(exitPoint);
        }
      }
    }

    // 4. SÉCURITÉ ANTI-CUL-DE-SAC
    // Si aucune nouvelle porte n'a été créée (hasard ou murs partout), on force une sortie.
    if (visualDoors.length === 0) {
      // On filtre les directions pour ne PAS choisir l'entrée ou un voisin existant (mur)
      const validRandomDirs = Object.values(DIRECTIONS).filter((dir) => {
        // Ne pas choisir l'arrière (entrée)
        const isEntry = dir.x === -direction.x && dir.y === -direction.y;
        if (isEntry) return false;

        // Ne pas choisir un voisin qui existe déjà (car s'il est là et qu'on n'a pas connecté avant, c'est qu'il a un mur)
        const nx = newChunkX + dir.x;
        const ny = newChunkY + dir.y;
        if (this.getChunk(nx, ny)) return false;

        return true;
      });

      // S'il reste des directions valides, on en prend une au hasard
      if (validRandomDirs.length > 0) {
        const randomDir =
          validRandomDirs[Math.floor(Math.random() * validRandomDirs.length)];
        const exitPoint = DIRECTIONS[randomDir.opp].entry;
        allTargets.push(exitPoint);
        visualDoors.push(exitPoint);
      }
    }

    // 5. CRÉATION DU CHUNK
    const newChunk = this.createChunk(
      newChunkX,
      newChunkY,
      entryPoint,
      allTargets,
      visualDoors,
    );
    this.chunks.set(`${newChunkX},${newChunkY}`, newChunk);

    // Stabilisation immédiate de l'entrée du nouveau chunk (double sécurité)
    newChunk.grid[entryPoint.y][entryPoint.x] = 1;
  }

  getTileAt(worldX, worldY) {
    const cx = Math.floor(worldX / CHUNK_SIZE);
    const cy = Math.floor(worldY / CHUNK_SIZE);

    const chunk = this.getChunk(cx, cy);

    if (!chunk) return 0;

    const localX = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((worldY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    return chunk.grid[localY][localX];
  }

  getEntityAt(worldX, worldY) {
    const cx = Math.floor(worldX / CHUNK_SIZE);
    const cy = Math.floor(worldY / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cy);

    if (!chunk) return null;

    const localX = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((worldY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    return chunk.entities.find((e) => e.x === localX && e.y === localY);
  }
}
