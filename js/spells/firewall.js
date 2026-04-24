import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, enemyAt, setMessage } from "../utils.js";
import { applyStatus, addFloorEffect } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import {
  tileCenter, strokeTile, strokeReticle, fillCircle
} from "./_draw.js";

export const meta = {
  id: "firewall",
  name: "Firewall",
  school: "fire",
  cost: 6,
  targeting: "line",
  range: 6,
  desc: "3-tile burn wall across the aim axis."
};

function wallTilesFor(tx, ty) {
  const dxm = tx - state.player.x;
  const dym = ty - state.player.y;
  return Math.abs(dxm) >= Math.abs(dym)
    ? [{ x: tx, y: ty - 1 }, { x: tx, y: ty }, { x: tx, y: ty + 1 }]
    : [{ x: tx - 1, y: ty }, { x: tx, y: ty }, { x: tx + 1, y: ty }];
}

export function drawAim({ mx, my, charged }) {
  const tiles = wallTilesFor(mx, my);
  for (const t of tiles) {
    const valid = inBounds(t.x, t.y) && state.map[t.y][t.x] !== 1;
    strokeTile(t.x, t.y, valid ? "#ff7a3a" : "#5a2a2a", { inset: 4, width: 2, alpha: 0.8 });
  }
  strokeReticle(mx, my, charged);
}

const flares = [];

export function renderFx() {
  for (let i = flares.length - 1; i >= 0; i--) {
    const f = flares[i];
    const t = 1 - f.life / f.max;
    fillCircle(f.cx, f.cy, 4 + t * 14, "#ff7a3a", { alpha: (1 - t) * 0.8 });
    fillCircle(f.cx, f.cy, 3 + t * 6, "#ffd166", { alpha: 1 - t });
    f.life--;
    if (f.life <= 0) flares.splice(i, 1);
  }
}

export function effect(ctx) {
  const { tx, ty, rank, pow, baseDmg, spell } = ctx;
  const tiles = wallTilesFor(tx, ty);
  const duration = 10 + rank * 3;
  const power = 2 + Math.floor(pow / 3);
  let placed = 0;
  let hit = 0;
  for (const t of tiles) {
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1) continue;
    addFloorEffect(t.x, t.y, "burn", duration, power);
    const c = tileCenter(t.x, t.y);
    flares.push({ cx: c.x, cy: c.y, life: 18, max: 18 });
    const e = enemyAt(t.x, t.y);
    if (e) { damageEnemy(e, baseDmg, spell.school); applyStatus(e, "burn", 8, power); hit++; }
    placed++;
  }
  if (!placed) { setMessage("Firewall has no ground to claim."); return { acted: false }; }
  clearDeadEnemies();
  setMessage(`Firewall: ${placed} tiles ablaze${hit ? `, ${hit} scorched` : ""}.`);
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
