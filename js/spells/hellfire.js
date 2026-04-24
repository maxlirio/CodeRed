import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { distance, setMessage, inBounds } from "../utils.js";
import { spawnBurst, applyStatus, addFloorEffect, doScreenShake } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "hellfire",
  name: "Hellfire",
  school: "fire",
  cost: 14,
  targeting: "self",
  desc: "Eruption of fire 3 tiles out; heavy damage, long burn field."
};

export function effect(ctx) {
  const { rank, baseDmg, spell } = ctx;
  const targets = state.enemies.filter((e) => distance(e, state.player) <= 3);
  for (const e of targets) {
    damageEnemy(e, Math.floor(baseDmg * 1.3), spell.school);
    applyStatus(e, "burn", 12 + rank * 2, 3);
    spawnBurst(e.x, e.y, "#ff7a3a", 12);
  }
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const x = state.player.x + dx;
      const y = state.player.y + dy;
      if (!inBounds(x, y) || state.map[y][x] === 1) continue;
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;
      addFloorEffect(x, y, "burn", 8 + rank, 2);
    }
  }
  doScreenShake(8);
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.fire, 24);
  clearDeadEnemies();
  setMessage(`Hellfire engulfs ${targets.length} foes.`);
  return { acted: true, offensive: true };
}
