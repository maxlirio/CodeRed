import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize } from "../config.js";
import { inBounds, enemyAt, setMessage } from "../utils.js";
import { applyStatus } from "../fx.js";
import {
  tileCenter, strokeTile, strokeReticle, strokeLinePx, strokeCircle
} from "./_draw.js";

export const meta = {
  id: "huntersmark",
  name: "Hunter's Mark",
  school: "life",
  cost: 3,
  targeting: "aim",
  range: 10,
  desc: "Mark a foe 3 turns: +50% damage, refunds 1 MP per hit."
};

export function drawAim({ mx, my, charged }) {
  if (!inBounds(mx, my)) { strokeReticle(mx, my, charged); return; }
  const e = enemyAt(mx, my);
  strokeTile(mx, my, e ? "#fca5ff" : "#7a3030", { inset: 2, width: 2, alpha: 0.9 });
  if (e) {
    const c = tileCenter(mx, my);
    const r = tileSize * 0.45;
    strokeCircle(c.x, c.y, r, "#fca5ff", { width: 1.5, alpha: 0.7 });
    strokeLinePx(c.x - r, c.y, c.x - 2, c.y, "#fca5ff", { width: 1.5, alpha: 0.7 });
    strokeLinePx(c.x + 2, c.y, c.x + r, c.y, "#fca5ff", { width: 1.5, alpha: 0.7 });
    strokeLinePx(c.x, c.y - r, c.x, c.y - 2, "#fca5ff", { width: 1.5, alpha: 0.7 });
    strokeLinePx(c.x, c.y + 2, c.x, c.y + r, "#fca5ff", { width: 1.5, alpha: 0.7 });
  }
  strokeReticle(mx, my, charged);
}

const reticles = [];

export function renderFx() {
  for (let i = reticles.length - 1; i >= 0; i--) {
    const r = reticles[i];
    const t = 1 - r.life / r.max;
    const tgt = state.enemies.find((e) => e.id === r.enemyId);
    if (!tgt) { reticles.splice(i, 1); continue; }
    const c = tileCenter(tgt.x, tgt.y);
    const rad = tileSize * (0.8 - t * 0.35);
    strokeCircle(c.x, c.y, rad, "#fca5ff", { width: 2, alpha: 1 - t });
    strokeLinePx(c.x - rad, c.y, c.x - rad * 0.3, c.y, "#fca5ff", { width: 2, alpha: 1 - t });
    strokeLinePx(c.x + rad * 0.3, c.y, c.x + rad, c.y, "#fca5ff", { width: 2, alpha: 1 - t });
    strokeLinePx(c.x, c.y - rad, c.x, c.y - rad * 0.3, "#fca5ff", { width: 2, alpha: 1 - t });
    strokeLinePx(c.x, c.y + rad * 0.3, c.x, c.y + rad, "#fca5ff", { width: 2, alpha: 1 - t });
    r.life--;
    if (r.life <= 0) reticles.splice(i, 1);
  }
}

export function effect(ctx) {
  const { tx, ty, rank } = ctx;
  const enemy = enemyAt(tx, ty);
  if (!enemy) { setMessage("Hunter's Mark needs a target."); return { acted: false }; }
  if (!enemy.id) enemy.id = `e_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  applyStatus(enemy, "mark", 3 + rank, 1);
  reticles.push({ enemyId: enemy.id, life: 26, max: 26 });
  setMessage(`${enemy.name} is marked.`);
  return { acted: true, offensive: false };
}
