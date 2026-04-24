import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { distance, setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "icenova",
  name: "Ice Nova",
  school: "frost",
  cost: 9,
  targeting: "self",
  desc: "Chill and damage all enemies within 4 tiles."
};

export function effect(ctx) {
  const { rank, baseDmg, spell } = ctx;
  const nearby = state.enemies.filter((e) => distance(e, state.player) <= 4);
  if (!nearby.length) { setMessage("Ice Nova finds no targets."); return { acted: false }; }
  for (const e of nearby) {
    damageEnemy(e, baseDmg, spell.school);
    applyStatus(e, "chill", 10 + rank * 3, 1);
    spawnBurst(e.x, e.y, SCHOOL_COLORS.frost, 8);
  }
  spawnBurst(state.player.x, state.player.y, "#a8f3ff", 18);
  clearDeadEnemies();
  setMessage(`Ice Nova hits ${nearby.length} foes.`);
  return { acted: true, offensive: true };
}
