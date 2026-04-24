import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, enemyAt, lineTiles, setMessage } from "../utils.js";
import { spawnBeam, spawnBurst, applyStatus, isWallBlocked, doScreenShake } from "../fx.js";
import { damageEnemy, clearDeadEnemies } from "../combat.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "sunbolt",
  name: "Sunbolt",
  school: "fire",
  cost: 12,
  targeting: "line",
  range: 12,
  desc: "Piercing beam of searing light. Heavy damage, long burn."
};

export function drawAim({ mx, my, charged }) {
  const line = lineTiles(state.player.x, state.player.y, mx, my).slice(1);
  for (const t of line) {
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1) break;
    strokeTile(t.x, t.y, "#ffd166", { inset: 5, width: 1, alpha: 0.7 });
  }
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty, rank, baseDmg, spell } = ctx;
  const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
  let hit = 0;
  let end = state.player;
  const dmg = Math.floor(baseDmg * 1.8);
  for (const t of line) {
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1 || isWallBlocked(t.x, t.y)) break;
    end = t;
    const e = enemyAt(t.x, t.y);
    if (e) {
      damageEnemy(e, dmg, spell.school);
      applyStatus(e, "burn", 12 + rank * 2, 3);
      spawnBurst(t.x, t.y, "#ffd166", 10);
      hit++;
    }
  }
  spawnBeam(state.player.x, state.player.y, end.x, end.y, "#ffd166");
  doScreenShake(4);
  clearDeadEnemies();
  setMessage(hit ? `Sunbolt sears ${hit} foes.` : "Sunbolt pierces empty air.");
  ctx.recordLast(tx, ty);
  return { acted: true, offensive: true };
}
