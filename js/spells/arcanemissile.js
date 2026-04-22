import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, enemyAt, setMessage } from "../utils.js";
import { applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import {
  tileCenter, strokeTile, strokeReticle, strokePolyline, fillCircle
} from "./_draw.js";

export const meta = {
  id: "arcanemissile",
  name: "Arcane Missile",
  school: "arcane",
  cost: 5,
  targeting: "aim",
  range: 12,
  desc: "Seeking bolt. Ignores walls and line-of-sight."
};

export function drawAim({ mx, my, charged }) {
  if (!inBounds(mx, my)) { strokeReticle(mx, my, charged); return; }
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? SCHOOL_COLORS.arcane : "#7a3030", { inset: 2, width: 2, alpha: 0.9 });
  const a = tileCenter(state.player.x, state.player.y);
  const b = tileCenter(mx, my);
  const curve = curvedPoints(a.x, a.y, b.x, b.y, 12);
  strokePolyline(curve, SCHOOL_COLORS.arcane, { width: 1, alpha: 0.5 });
  strokeReticle(mx, my, charged);
}

function curvedPoints(x1, y1, x2, y2, segs) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const nx = -dy, ny = dx;
  const nl = Math.hypot(nx, ny) || 1;
  const sway = Math.min(40, nl * 0.15);
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const bend = Math.sin(t * Math.PI) * sway;
    pts.push({ x: x1 + dx * t + (nx / nl) * bend, y: y1 + dy * t + (ny / nl) * bend });
  }
  return pts;
}

const missiles = [];

export function renderFx() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    const t = 1 - m.life / m.max;
    const show = Math.min(m.points.length - 1, Math.floor(m.points.length * t));
    const head = m.points[show];
    const trail = m.points.slice(Math.max(0, show - 6), show + 1);
    strokePolyline(trail, SCHOOL_COLORS.arcane, { width: 3, alpha: 1 });
    strokePolyline(trail, "#ffffff", { width: 1.5, alpha: 0.9 });
    if (head) {
      fillCircle(head.x, head.y, 5, "#ffffff", { alpha: 1 });
      fillCircle(head.x, head.y, 8, SCHOOL_COLORS.arcane, { alpha: 0.6 });
    }
    m.life--;
    if (m.life <= 0) missiles.splice(i, 1);
  }
}

export function effect(ctx) {
  const { tx, ty, baseDmg, spell } = ctx;
  const enemy = enemyAt(tx, ty);
  if (!enemy) { setMessage("Arcane Missile needs a target."); return { acted: false }; }
  const a = tileCenter(state.player.x, state.player.y);
  const b = tileCenter(tx, ty);
  missiles.push({ points: curvedPoints(a.x, a.y, b.x, b.y, 18), life: 16, max: 16 });
  const dealt = damageEnemy(enemy, baseDmg, spell.school);
  applyStatus(enemy, "shock", 1, 1);
  clearDeadEnemies();
  setMessage(`Arcane Missile strikes ${enemy.name} for ${dealt}.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
