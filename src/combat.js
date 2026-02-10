const LANE = [0, 1, 2, 3];
let hitTime = 2000;
let noteTypes = ["short", "long"];
let duration = 0;

function getNoteY(hitTime, speed) {
  const currentTime = Date.now();
  const timeUntilHit = hitTime - currentTime;
  return HIT_ZONE_Y - timeUntilHit * NOTE_SPEED;
}

import {
  GOOD_WINDOW,
  HIT_ZONE_Y,
  MISS_LIMIT,
  NOTE_SPEED,
  PERFECT_WINDOW,
  VIEWPORT_WIDTH_HEIGHT,
} from "./constants.js";
import { gameState } from "./state.js";

export class CombatEngine {
  constructor() {
    this.startTime = 0;
    this.notes = [];
    this.activeNotes = [];
    this.feedback = null;
    this.lanes = [false, false, false, false];
  }

  start(partition, riftX, riftY) {
    this.startTime = Date.now();
    this.notes = partition;
    this.currentRiftPos = { x: riftX, y: riftY };
    gameState.resolution = 100;
  }

  update() {
    if (gameState.mode !== "combat") return;

    gameState.resolution -= 0.1;

    if (gameState.resolution <= 0) {
      gameState.resolution = 100;
      gameState.hp = 1;
      this.notes = [];
    }

    if (gameState.hp <= 0) {
      gameState.mode = "exploration";
      gameState.resolution = 100;
      console.log("GAME OVER !");
      return;
    }

    const currentTime = Date.now() - this.startTime;

    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];

      if (currentTime - note.hitTime > Math.abs(MISS_LIMIT)) {
        console.log("RATÉ ! - PV");
        gameState.hp -= 10;
        this.notes.splice(i, 1);
      }
    }

    // Fin du combat
    if (this.notes.length === 0 && gameState.hp > 0) {
      console.log("FAILLE RÉSOLUE ! +10 Essence");
      gameState.essence += 10;
      this.world.removeEntityAt(this.currentRiftPos.x, this.currentRiftPos.y);
      gameState.mode = "exploration";
    }
  }

  draw(ctx) {
    const LANE_WIDTH = VIEWPORT_WIDTH_HEIGHT / 4;

    // 4 Lanes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    for (let i = 0; i < 4; i++) {
      const x = i * LANE_WIDTH;
      ctx.strokeRect(x, 0, LANE_WIDTH, VIEWPORT_WIDTH_HEIGHT);

      //(A, Z, E, R)
      ctx.fillStyle = "#555";
      ctx.font = "20px Arial";
      ctx.fillText(
        ["A", "Z", "E", "R"][i],
        x + LANE_WIDTH / 2 - 10,
        VIEWPORT_WIDTH_HEIGHT - 20,
      );
    }

    for (let i = 0; i < 4; i++) {
      if (this.lanes[i]) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
        ctx.fillRect(i * LANE_WIDTH, 0, LANE_WIDTH, VIEWPORT_WIDTH_HEIGHT);
      }
    }

    if (this.feedback && Date.now() - this.feedback.time < 500) {
      ctx.fillStyle = this.feedback.color;
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        this.feedback.text,
        VIEWPORT_WIDTH_HEIGHT / 2,
        HIT_ZONE_Y - 100,
      );
    }

    // Judgment Line
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, HIT_ZONE_Y);
    ctx.lineTo(VIEWPORT_WIDTH_HEIGHT, HIT_ZONE_Y);
    ctx.stroke();

    // Notes
    const currentTime = Date.now() - this.startTime;
    this.notes.forEach((note) => {
      const timeUntilHit = note.hitTime - currentTime;

      if (timeUntilHit < 2000 && timeUntilHit > -200) {
        const y = HIT_ZONE_Y - timeUntilHit * NOTE_SPEED;
        const x = note.lane * LANE_WIDTH;

        ctx.fillStyle = "#00ffff";
        ctx.fillRect(x + 10, y - 10, LANE_WIDTH - 20, 20);
      }
    });
  }

  handleInput(lane) {
    const currentTime = Date.now() - this.startTime;

    this.lanes[lane] = true;
    setTimeout(() => {
      this.lanes[lane] = false;
    }, 100);

    const noteIndex = this.notes.findIndex((note) => note.lane === lane);

    if (noteIndex === -1) return;

    const note = this.notes[noteIndex];
    const diff = Math.abs(note.hitTime - currentTime);

    if (diff <= PERFECT_WINDOW) {
      console.log("PERFECT!");
      this.feedback = { text: "PERFECT!", color: "#00ff80", time: Date.now() };
      this.notes.splice(noteIndex, 1);
    } else if (diff <= GOOD_WINDOW) {
      console.log("GOOD!");
      this.feedback = { text: "GOOD", color: "#4488ff", time: Date.now() };
      this.notes.splice(noteIndex, 1);
    } else {
      console.log("MISS ! - PV");
      this.feedback = { text: "MISS!", color: "#df1b01", time: Date.now() };
      gameState.hp -= Math.floor(gameState.maxHp * 0.03);
    }
  }
}
