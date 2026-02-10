export let gameState = {
  // --- META PROGRESSION ---
  essence: 0,
  upgrades: {
    maxHp: 0,
    baseTiming: 0,
    unlockedItems: [],
  },

  // -- CURRENT RUN ---
  mode: "exploration",
  playerCoordinate: [8, 8],
  hp: 100,
  maxHp: 100,
  resolution: 100,
  currentItems: [],
};
