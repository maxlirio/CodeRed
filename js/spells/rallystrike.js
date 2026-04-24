import { state } from "../state.js";
import { setMessage, distance } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "rallystrike",
  name: "Rally Strike",
  school: "life",
  cost: 6,
  targeting: "self",
  desc: "Strike all adjacent foes and steel your resolve (+regen)."
};

export function effect(ctx) {
  const { rank, baseDmg } = ctx;
  const adj = state.enemies.filter((e) => distance(e, state.player) <= 1);
  for (const e of adj) {
    damageEnemy(e, Math.floor(baseDmg * 0.9), "life");
    spawnBurst(e.x, e.y, "#ffd166", 8);
  }
  applyStatus(state.player, "regen", 10 + rank * 2, 3);
  clearDeadEnemies();
  setMessage(adj.length ? `Rally Strike hits ${adj.length} foes.` : "Rally Strike: no foe in reach.");
  return { acted: true, offensive: adj.length > 0 };
}
