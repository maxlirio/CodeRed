import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize } from "../config.js";
import { inBounds, enemyAt, setMessage } from "../utils.js";
import { applyStatus } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import {
  tileCenter, strokeTile, strokeReticle, strokeLinePx, fillCircle
} from "./_draw.js";

export const meta = {
  id: "glacialprison",
  name: "Glacial Prison",
  school: "frost",
  cost: 6,
  targeting: "aim",
  range: 8,
  desc: "Freeze a foe 2 turns. Extra damage while imprisoned."
};

export function drawAim({ mx, my, charged }) {
  if (!inBounds(mx, my)) { strokeReticle(mx, my, charged); return; }
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? SCHOOL_COLORS.frost : "#7a3030", { inset: 2, width: 2, alpha: 0.9 });
  if (e) {
    const c = tileCenter(mx, my);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + Date.now() / 400;
      const rx = c.x + Math.cos(ang) * tileSize * 0.4;
      const ry = c.y + Math.sin(ang) * tileSize * 0.4;
      fillCircle(rx, ry, 2, "#dff6ff", { alpha: 0.8 });
    }
  }
  strokeReticle(mx, my, charged);
}

const prisons = [];

export function renderFx() {
  for (let i = prisons.length - 1; i >= 0; i--) {
    const p = prisons[i];
    const t = 1 - p.life / p.max;
    const r = tileSize * (0.2 + t * 0.4);
    const spikes = 8;
    for (let k = 0; k < spikes; k++) {
      const ang = (k / spikes) * Math.PI * 2;
      const sx = p.cx + Math.cos(ang) * r * 0.4;
      const sy = p.cy + Math.sin(ang) * r * 0.4;
      const ex = p.cx + Math.cos(ang) * r;
      const ey = p.cy + Math.sin(ang) * r;
      strokeLinePx(sx, sy, ex, ey, "#dff6ff", { width: 2, alpha: 1 - t });
      strokeLinePx(sx, sy, ex, ey, SCHOOL_COLORS.frost, { width: 1, alpha: (1 - t) * 0.8 });
    }
    fillCircle(p.cx, p.cy, r * 0.3, "#ffffff", { alpha: (1 - t) * 0.7 });
    p.life--;
    if (p.life <= 0) prisons.splice(i, 1);
  }
}

export function effect(ctx) {
  const { tx, ty, baseDmg, spell } = ctx;
  const enemy = enemyAt(tx, ty);
  if (!enemy) { setMessage("Glacial Prison needs a target."); return { acted: false }; }
  const dmg = Math.floor(baseDmg * 1.2);
  damageEnemy(enemy, dmg, spell.school);
  applyStatus(enemy, "chill", 3, 1);
  applyStatus(enemy, "stun", 2, 1);
  const c = tileCenter(tx, ty);
  prisons.push({ cx: c.x, cy: c.y, life: 26, max: 26 });
  clearDeadEnemies();
  setMessage(`${enemy.name} is imprisoned in ice.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
