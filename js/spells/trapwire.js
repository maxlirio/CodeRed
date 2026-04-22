import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, enemyAt, lineTiles, setMessage } from "../utils.js";
import { addFloorEffect, isWallBlocked } from "../fx.js";
import {
  tileCenter, strokeTile, strokeReticle, strokeLinePx, fillCircle
} from "./_draw.js";

export const meta = {
  id: "trapwire",
  name: "Trapwire",
  school: "life",
  cost: 3,
  targeting: "line",
  range: 6,
  desc: "3-tile tripwire along the aim line. Damages + roots on trigger."
};

function placementTiles(tx, ty) {
  const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
  const tiles = [];
  for (const t of line) {
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1 || isWallBlocked(t.x, t.y)) break;
    tiles.push(t);
    if (tiles.length >= 3) break;
  }
  return tiles;
}

export function drawAim({ mx, my, charged }) {
  const tiles = placementTiles(mx, my);
  for (const t of tiles) {
    strokeTile(t.x, t.y, SCHOOL_COLORS.life, { inset: 4, width: 2, alpha: 0.75 });
  }
  for (let i = 0; i < tiles.length - 1; i++) {
    const a = tileCenter(tiles[i].x, tiles[i].y);
    const b = tileCenter(tiles[i + 1].x, tiles[i + 1].y);
    strokeLinePx(a.x, a.y, b.x, b.y, SCHOOL_COLORS.life, { width: 1, alpha: 0.6 });
  }
  strokeReticle(mx, my, charged);
}

const placements = [];

export function renderFx() {
  for (let i = placements.length - 1; i >= 0; i--) {
    const p = placements[i];
    const t = 1 - p.life / p.max;
    fillCircle(p.cx, p.cy, 3 + t * 6, SCHOOL_COLORS.life, { alpha: (1 - t) * 0.9 });
    p.life--;
    if (p.life <= 0) placements.splice(i, 1);
  }
}

export function effect(ctx) {
  const { tx, ty, rank } = ctx;
  const tiles = placementTiles(tx, ty);
  if (!tiles.length) { setMessage("No ground to wire."); return { acted: false }; }
  const duration = 10 + rank * 2;
  for (const t of tiles) {
    if (enemyAt(t.x, t.y)) continue;
    addFloorEffect(t.x, t.y, "trap", duration, 1);
    const c = tileCenter(t.x, t.y);
    placements.push({ cx: c.x, cy: c.y, life: 14, max: 14 });
  }
  setMessage(`Trapwire primed across ${tiles.length} tiles.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: false };
}
