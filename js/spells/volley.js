import { state } from "../state.js";
import { distance, setMessage } from "../utils.js";
import { spawnBeam, spawnBurst, applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "volley",
  name: "Volley",
  school: "storm",
  cost: 7,
  targeting: "self",
  desc: "Three arrows arc to the three nearest foes."
};

export function effect(ctx) {
  const { rank, baseDmg, spell } = ctx;
  const sorted = state.enemies
    .map((e) => ({ e, d: distance(e, state.player) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  if (!sorted.length) { setMessage("No targets in sight."); return { acted: false }; }
  for (const { e } of sorted) {
    damageEnemy(e, Math.floor(baseDmg * 0.9), spell.school);
    applyStatus(e, "mark", 6 + rank, 1);
    spawnBeam(state.player.x, state.player.y, e.x, e.y, "#ffd166");
    spawnBurst(e.x, e.y, "#ffd166", 8);
  }
  clearDeadEnemies();
  setMessage(`Volley strikes ${sorted.length} foes.`);
  return { acted: true, offensive: true };
}
