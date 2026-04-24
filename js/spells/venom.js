import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, enemyAt, setMessage } from "../utils.js";
import { spawnBurst, applyStatus, addFloorEffect } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "venom",
  name: "Venom Cloud",
  school: "life",
  cost: 8,
  targeting: "tile",
  range: 6,
  desc: "3x3 poison cloud: heavy burn that lingers 14 turns."
};

export function drawAim({ mx, my, charged }) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      strokeTile(mx + dx, my + dy, "#84f6a6", { inset: 5, width: 1, alpha: 0.6 });
    }
  }
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty, rank, pow, baseDmg, spell } = ctx;
  const power = 2 + Math.floor(pow / 3);
  let hit = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = tx + dx;
      const y = ty + dy;
      if (!inBounds(x, y) || state.map[y][x] === 1) continue;
      addFloorEffect(x, y, "burn", 14 + rank * 3, power);
      spawnBurst(x, y, SCHOOL_COLORS.life, 4);
      const e = enemyAt(x, y);
      if (e) { damageEnemy(e, baseDmg, spell.school); applyStatus(e, "burn", 10 + rank * 2, power); hit++; }
    }
  }
  clearDeadEnemies();
  setMessage(`Venom Cloud blooms${hit ? `, scorching ${hit}` : ""}.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
