import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { distance, setMessage } from "../utils.js";
import { spawnBurst, spawnBeam, applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "lightningstorm",
  name: "Lightning Storm",
  school: "storm",
  cost: 11,
  targeting: "self",
  desc: "Strike every visible enemy. Shocks them."
};

export function effect(ctx) {
  const { rank, baseDmg, spell } = ctx;
  const visible = state.enemies.filter((e) => distance(e, state.player) <= 8);
  if (!visible.length) { setMessage("Lightning Storm fizzles: no targets."); return { acted: false }; }
  for (const e of visible) {
    damageEnemy(e, Math.floor(baseDmg * 0.85), spell.school);
    applyStatus(e, "shock", 8 + rank * 2, 1);
    spawnBeam(state.player.x, state.player.y, e.x, e.y, SCHOOL_COLORS.storm);
    spawnBurst(e.x, e.y, "#e0c9ff", 6);
  }
  clearDeadEnemies();
  setMessage(`Lightning Storm strikes ${visible.length} foes.`);
  return { acted: true, offensive: true };
}
