export function createRandomPartition() {
  const partition = [];
  let nextHit = 2000;

  for (let i = 0; i < 15; i++) {
    partition.push({
      lane: Math.floor(Math.random() * 4),
      hitTime: nextHit,
      type: "short",
    });
    nextHit += 500 + Math.floor(Math.random() * 700);
  }

  return partition;
}
