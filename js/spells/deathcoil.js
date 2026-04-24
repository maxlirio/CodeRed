import { state } from "../state.js";
import { enemyAt, setMessage } from "../utils.js";
import { spawnBurst, spawnBeam } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "deathcoil",
  name: "Death Coil",
  school: "arcane",
  cost: 8,
  targeting: "enemy",
  range: 7,
  desc: "Shadow bolt; heal half the damage dealt."
};

export function drawAim({ mx, my, charged }) {
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? "#c79bff" : "#5a2a2a", { inset: 3, width: 2, alpha: 0.85 });
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty, baseDmg, spell } = ctx;
  const e = enemyAt(tx, ty);
  if (!e) { setMessage("Death Coil dissipates."); return { acted: false }; }
  const dealt = damageEnemy(e, Math.floor(baseDmg * 1.2), spell.school);
  const heal = Math.ceil(dealt / 2);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
  spawnBeam(state.player.x, state.player.y, e.x, e.y, "#c79bff");
  spawnBurst(e.x, e.y, "#c79bff", 10);
  clearDeadEnemies();
  setMessage(`Death Coil: ${dealt} damage, +${heal} HP.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
