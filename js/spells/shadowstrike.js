import { state } from "../state.js";
import { distance, setMessage, inBounds, isWalkable } from "../utils.js";
import { spawnBurst, isWallBlocked } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";

export const meta = {
  id: "shadowstrike",
  name: "Shadow Strike",
  school: "arcane",
  cost: 8,
  targeting: "self",
  desc: "Teleport behind nearest foe and deliver a devastating hit."
};

export function effect(ctx) {
  const { baseDmg, spell } = ctx;
  if (!state.enemies.length) { setMessage("No targets to strike."); return { acted: false }; }
  const target = state.enemies
    .map((e) => ({ e, d: distance(e, state.player) }))
    .sort((a, b) => a.d - b.d)[0].e;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let landed = null;
  for (const [dx, dy] of dirs) {
    const nx = target.x + dx;
    const ny = target.y + dy;
    if (inBounds(nx, ny) && isWalkable(nx, ny) && !isWallBlocked(nx, ny) && !(state.player.x === nx && state.player.y === ny)) {
      landed = { x: nx, y: ny }; break;
    }
  }
  if (!landed) { setMessage("No room to strike from shadow."); return { acted: false }; }
  spawnBurst(state.player.x, state.player.y, "#1f1f28", 10);
  state.player.x = landed.x;
  state.player.y = landed.y;
  spawnBurst(landed.x, landed.y, "#c79bff", 12);
  damageEnemy(target, Math.floor(baseDmg * 2.2), spell.school);
  spawnBurst(target.x, target.y, "#ff758f", 14);
  clearDeadEnemies();
  setMessage(`Shadow Strike ambushes ${target.name}.`);
  return { acted: true, offensive: true };
}
