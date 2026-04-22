import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize, HERO_SPRITE } from "../config.js";
import { inBounds, enemyAt, isWalkable, lineTiles, distance, setMessage } from "../utils.js";
import { applyStatus, isWallBlocked } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { drawSprite } from "../render.js";
import {
  ctx as canvasCtx, tileCenter, strokeTile, strokeReticle, strokeLinePx, fillCircle
} from "./_draw.js";

export const meta = {
  id: "vault",
  name: "Vault",
  school: "storm",
  cost: 4,
  targeting: "aim",
  range: 4,
  desc: "Dash up to 4 tiles, striking any foe along your path."
};

function pathFor(tx, ty) {
  const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
  const path = [];
  for (const t of line) {
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1 || isWallBlocked(t.x, t.y)) break;
    path.push(t);
    if (path.length >= meta.range) break;
  }
  return path;
}

export function drawAim({ mx, my, charged }) {
  const path = pathFor(mx, my);
  const inRange = distance({ x: mx, y: my }, state.player) <= meta.range;
  const col = inRange ? SCHOOL_COLORS.storm : "#7a3030";
  for (const t of path) {
    const hasFoe = !!enemyAt(t.x, t.y);
    strokeTile(t.x, t.y, hasFoe ? "#ffffff" : col, { inset: 5, width: 1, alpha: 0.7 });
  }
  if (path.length) {
    const a = tileCenter(state.player.x, state.player.y);
    const last = path[path.length - 1];
    const b = tileCenter(last.x, last.y);
    strokeLinePx(a.x, a.y, b.x, b.y, col, { width: 1, alpha: 0.35 });
  }
  strokeReticle(mx, my, charged);
}

const trails = [];
const strikes = [];

export function renderFx() {
  for (let i = trails.length - 1; i >= 0; i--) {
    const tr = trails[i];
    const a = tr.life / tr.max;
    canvasCtx.globalAlpha = a * 0.5;
    drawSprite(canvasCtx, HERO_SPRITE, tr.px, tr.py);
    canvasCtx.globalAlpha = 1;
    tr.life--;
    if (tr.life <= 0) trails.splice(i, 1);
  }
  for (let i = strikes.length - 1; i >= 0; i--) {
    const s = strikes[i];
    const t = 1 - s.life / s.max;
    fillCircle(s.cx, s.cy, 4 + t * 10, SCHOOL_COLORS.storm, { alpha: (1 - t) * 0.7 });
    fillCircle(s.cx, s.cy, 3, "#ffffff", { alpha: 1 - t });
    s.life--;
    if (s.life <= 0) strikes.splice(i, 1);
  }
}

function knockback(enemy, dx, dy) {
  const nx = enemy.x + dx;
  const ny = enemy.y + dy;
  if (isWalkable(nx, ny) && !enemyAt(nx, ny) && !isWallBlocked(nx, ny) && !(state.player.x === nx && state.player.y === ny)) {
    enemy.x = nx; enemy.y = ny;
  }
}

export function effect(ctx) {
  const { tx, ty, baseDmg, spell } = ctx;
  const path = pathFor(tx, ty);
  if (!path.length) { setMessage("No path to vault."); return { acted: false }; }
  const dxStep = Math.sign(tx - state.player.x);
  const dyStep = Math.sign(ty - state.player.y);
  const dmg = Math.floor(baseDmg + state.player.atk * 0.6);
  let landed = null;
  const fromX = state.player.x;
  const fromY = state.player.y;
  for (const t of path) {
    const foe = enemyAt(t.x, t.y);
    if (foe) {
      damageEnemy(foe, dmg, spell.school);
      applyStatus(foe, "shock", 1, 1);
      const c = tileCenter(foe.x, foe.y);
      strikes.push({ cx: c.x, cy: c.y, life: 14, max: 14 });
      knockback(foe, dxStep, dyStep);
      if (!landed) landed = { x: t.x, y: t.y };
      continue;
    }
    landed = t;
  }
  if (!landed) landed = path[path.length - 1];
  trails.push({ px: fromX * tileSize, py: fromY * tileSize, life: 14, max: 14 });
  for (let i = 0; i < path.length; i++) {
    const mid = path[i];
    if (mid.x === landed.x && mid.y === landed.y) break;
    trails.push({ px: mid.x * tileSize, py: mid.y * tileSize, life: 12 - i, max: 14 });
  }
  state.player.x = landed.x;
  state.player.y = landed.y;
  clearDeadEnemies();
  setMessage(`Vault strike.`);
  ctx.recordLast(landed.x, landed.y);
  return { acted: true, offensive: true };
}
