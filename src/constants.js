export const TILE_SIZE = 32;
export const CHUNK_SIZE = 16;
export const VIEWPORT_WIDTH_HEIGHT = 640;
export const DIRECTIONS = {
  north: { x: 0, y: -1, opp: "south", entry: { x: 8, y: 15 } },
  south: { x: 0, y: 1, opp: "north", entry: { x: 8, y: 0 } },
  east: { x: 1, y: 0, opp: "west", entry: { x: 0, y: 8 } },
  west: { x: -1, y: 0, opp: "east", entry: { x: 15, y: 8 } },
};
export const VISION_RADIUS = 5;
export const BASE_TIMING = 10;
