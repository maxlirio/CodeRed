import { state } from "../state.js";
import { enemyAt, setMessage } from "../utils.js";
import { spawnBurst, spawnBeam } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "smite",
  name: "Smite",
  school: "life",
  cost: 7,
  targeting: "enemy",
  range: 6,
  desc: "Pillar of holy light strikes one foe for heavy damage, triple vs boss."
};

export function drawAim({ mx, my, charged }) {
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? "#ffd166" : "#5a2a2a", { inset: 3, width: 2, alpha: 0.85 });
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty, baseDmg, spell } = ctx;
  const e = enemyAt(tx, ty);
  if (!e) { setMessage("Smite finds no foe."); return { acted: false }; }
  const mult = e.boss ? 3 : 1.5;
  damageEnemy(e, Math.floor(baseDmg * mult), spell.school);
  spawnBeam(state.player.x, state.player.y, e.x, e.y, "#ffd166");
  spawnBurst(e.x, e.y, "#ffd166", 14);
  clearDeadEnemies();
  setMessage(`Smite sears ${e.name}.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
