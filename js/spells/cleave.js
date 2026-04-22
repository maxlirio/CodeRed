import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize } from "../config.js";
import { distance, isWalkable, enemyAt, setMessage } from "../utils.js";
import { applyStatus, isWallBlocked } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { tileCenter, strokeCircle, strokePolyline, fillCircle } from "./_draw.js";

export const meta = {
  id: "cleave",
  name: "Cleave",
  school: "storm",
  cost: 4,
  targeting: "self",
  range: 1,
  desc: "Hits all adjacent foes, knocks them back. Stun on crit."
};

const sweeps = [];

export function renderFx() {
  for (let i = sweeps.length - 1; i >= 0; i--) {
    const s = sweeps[i];
    const t = 1 - s.life / s.max;
    const ctr = tileCenter(state.player.x, state.player.y);
    const r = tileSize * (0.45 + t * 0.9);
    strokeCircle(ctr.x, ctr.y, r, "#ffffff", { width: 3, alpha: 1 - t });
    strokeCircle(ctr.x, ctr.y, r * 0.85, SCHOOL_COLORS.storm, { width: 2, alpha: (1 - t) * 0.8 });
    const segs = 16;
    const pts = [];
    for (let k = 0; k <= segs; k++) {
      const ang = (k / segs) * Math.PI * 2;
      const jr = r + (Math.random() - 0.5) * 4;
      pts.push({ x: ctr.x + Math.cos(ang) * jr, y: ctr.y + Math.sin(ang) * jr });
    }
    strokePolyline(pts, SCHOOL_COLORS.storm, { width: 1, alpha: (1 - t) * 0.7 });
    s.life--;
    if (s.life <= 0) sweeps.splice(i, 1);
  }
}

function knockback(enemy) {
  const dx = Math.sign(enemy.x - state.player.x);
  const dy = Math.sign(enemy.y - state.player.y);
  const nx = enemy.x + dx;
  const ny = enemy.y + dy;
  if (isWalkable(nx, ny) && !enemyAt(nx, ny) && !isWallBlocked(nx, ny) && !(state.player.x === nx && state.player.y === ny)) {
    enemy.x = nx; enemy.y = ny;
  }
}

export function effect(ctx) {
  const { baseDmg, isCrit, spell } = ctx;
  const near = state.enemies.filter((e) => distance(e, state.player) === 1);
  if (!near.length) { setMessage("No adjacent foes to cleave."); return { acted: false }; }
  const atkDmg = Math.floor(baseDmg + state.player.atk * 0.5);
  for (const e of near) {
    damageEnemy(e, atkDmg, spell.school);
    const c = tileCenter(e.x, e.y);
    for (let k = 0; k < 6; k++) fillCircle(c.x, c.y, 2, SCHOOL_COLORS.storm);
    if (isCrit) applyStatus(e, "stun", 1, 1);
    knockback(e);
  }
  sweeps.push({ life: 16, max: 16 });
  clearDeadEnemies();
  setMessage(`Cleave arcs through ${near.length} foes${isCrit ? " (crit stun!)" : ""}.`);
  ctx.recordLast(state.player.x, state.player.y);
  return { acted: true, offensive: true };
}
