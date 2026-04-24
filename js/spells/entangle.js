import { state } from "../state.js";
import { enemyAt, setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "entangle",
  name: "Entangle",
  school: "life",
  cost: 5,
  targeting: "enemy",
  range: 6,
  desc: "Vines lock a foe in place for a long time."
};

export function drawAim({ mx, my, charged }) {
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? "#84f6a6" : "#5a2a2a", { inset: 3, width: 2, alpha: 0.85 });
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty, rank, baseDmg, spell } = ctx;
  const e = enemyAt(tx, ty);
  if (!e) { setMessage("Entangle finds no foe."); return { acted: false }; }
  damageEnemy(e, Math.floor(baseDmg * 0.6), spell.school);
  applyStatus(e, "stun", 16 + rank * 4, 1);
  spawnBurst(e.x, e.y, "#84f6a6", 12);
  clearDeadEnemies();
  setMessage(`Entangle roots ${e.name}.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
