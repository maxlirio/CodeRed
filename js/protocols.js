import { state } from "./state.js";
import { distance, inBounds, isWalkable, enemyAt, lineTiles, setMessage } from "./utils.js";
import {
  spawnBurst, spawnBeam, doScreenShake,
  hasStatus, applyStatus, isWallBlocked
} from "./fx.js";
import { playerTakeDamage, clearDeadEnemies } from "./combat.js";

function stepTo(enemy, tx, ty, { ethereal = false } = {}) {
  if (!inBounds(tx, ty)) return false;
  if (!ethereal && !isWalkable(tx, ty)) return false;
  if (!ethereal && isWallBlocked(tx, ty)) return false;
  const other = enemyAt(tx, ty);
  if (other && other !== enemy) return false;
  if (state.player.x === tx && state.player.y === ty) return false;
  enemy.x = tx;
  enemy.y = ty;
  return true;
}

function stepToward(enemy, target, opts) {
  const dx = Math.sign(target.x - enemy.x);
  const dy = Math.sign(target.y - enemy.y);
  if (Math.abs(target.x - enemy.x) >= Math.abs(target.y - enemy.y)) {
    if (dx && stepTo(enemy, enemy.x + dx, enemy.y, opts)) return true;
    if (dy && stepTo(enemy, enemy.x, enemy.y + dy, opts)) return true;
  } else {
    if (dy && stepTo(enemy, enemy.x, enemy.y + dy, opts)) return true;
    if (dx && stepTo(enemy, enemy.x + dx, enemy.y, opts)) return true;
  }
  return false;
}

function stepAway(enemy, target) {
  const dx = enemy.x === target.x ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(target.x - enemy.x);
  const dy = enemy.y === target.y ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(target.y - enemy.y);
  if (stepTo(enemy, enemy.x + dx, enemy.y)) return true;
  if (stepTo(enemy, enemy.x, enemy.y + dy)) return true;
  return false;
}

function randomStep(enemy) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
  stepTo(enemy, enemy.x + dx, enemy.y + dy);
}

function meleePlayer(enemy, mult = 1, label = null) {
  const raw = Math.max(1, Math.floor((enemy.atk + Math.floor(state.floor / 3)) * mult));
  const dmg = playerTakeDamage(raw);
  spawnBurst(state.player.x, state.player.y, "#ff758f", 7);
  state.lastHitBy = enemy.name;
  setMessage(label || `${enemy.name} hits you for ${dmg}.`);
  return dmg;
}

function hasLineOfSight(x1, y1, x2, y2) {
  const tiles = lineTiles(x1, y1, x2, y2);
  for (let i = 1; i < tiles.length - 1; i++) {
    const t = tiles[i];
    if (!inBounds(t.x, t.y) || state.map[t.y][t.x] === 1) return false;
  }
  return true;
}

function advanceAndStrike(e, mult = 1) {
  stepToward(e, state.player);
  if (distance(e, state.player) === 1) meleePlayer(e, mult);
}

function pSlime(e) {
  const d = distance(e, state.player);
  if (d === 1) return meleePlayer(e);
  if (d <= e.vision) { advanceAndStrike(e); return; }
  if (Math.random() < 0.35) randomStep(e);
}

function pGoblin(e) {
  const d = distance(e, state.player);
  if (d === 1) return meleePlayer(e);
  if (d <= e.vision) advanceAndStrike(e);
}

function pBat(e) {
  const d = distance(e, state.player);
  if (d === 1) { meleePlayer(e); stepAway(e, state.player); return; }
  if (d <= e.vision) {
    stepToward(e, state.player);
    if (distance(e, state.player) === 1) { meleePlayer(e); stepAway(e, state.player); return; }
    if (distance(e, state.player) > 3) stepToward(e, state.player);
    if (distance(e, state.player) === 1) { meleePlayer(e); stepAway(e, state.player); }
  }
}

function pSkeleton(e) {
  const d = distance(e, state.player);
  if (d === 1) return meleePlayer(e);
  if (d <= e.vision) advanceAndStrike(e);
}

function pImp(e) {
  e.protoState ??= { shotTimer: 800 };
  const d = distance(e, state.player);
  if (d === 1) return meleePlayer(e);
  if (d < 3) { stepAway(e, state.player); return; }
  if (d <= 5 && hasLineOfSight(e.x, e.y, state.player.x, state.player.y)) {
    if (e.protoState.shotTimer <= 0) {
      spawnBeam(e.x, e.y, state.player.x, state.player.y, "#ff7a3a");
      const dmg = playerTakeDamage(Math.max(2, Math.floor(e.atk / 2) + 1));
      applyStatus(state.player, "burn", 3, 2);
      state.lastHitBy = e.name;
      setMessage(`${e.name} spits fire: ${dmg} + burn.`);
      e.protoState.shotTimer = 1500;
      return;
    }
  }
  if (d > 6) stepToward(e, state.player);
}

function pWolf(e) {
  const d = distance(e, state.player);
  if (d === 1) return meleePlayer(e, 1.15);
  if (d <= e.vision) advanceAndStrike(e, 1.15);
}

function pOrc(e) {
  e.protoState ??= { telegraphed: false };
  const d = distance(e, state.player);
  if (e.protoState.telegraphed) {
    e.protoState.telegraphed = false;
    if (d === 1) { meleePlayer(e, 1.7, `${e.name} SLAMS you!`); doScreenShake(5); }
    else setMessage(`${e.name}'s slam whiffs.`);
    return;
  }
  if (d === 1 || d === 2) {
    e.protoState.telegraphed = true;
    spawnBurst(e.x, e.y, "#ffd166", 6);
    setMessage(`${e.name} winds up a slam!`);
    return;
  }
  if (d <= e.vision) stepToward(e, state.player);
}

function wraithStrike(e) {
  const dmg = meleePlayer(e);
  const heal = Math.ceil(dmg / 2);
  e.hp = Math.min(e.maxHp, e.hp + heal);
  spawnBurst(e.x, e.y, "#9bc4ff", 6);
}

function pWraith(e) {
  const d = distance(e, state.player);
  if (d === 1) return wraithStrike(e);
  if (d <= e.vision) {
    stepToward(e, state.player, { ethereal: true });
    if (distance(e, state.player) === 1) wraithStrike(e);
  }
}

function spawnBossAdd(e) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
  for (const [dx, dy] of dirs) {
    const nx = e.x + dx;
    const ny = e.y + dy;
    if (!inBounds(nx, ny) || state.map[ny][nx] === 1) continue;
    if (enemyAt(nx, ny)) continue;
    if (state.player.x === nx && state.player.y === ny) continue;
    state.enemies.push({
      x: nx, y: ny, type: "slime", name: "slimeling",
      hp: 6, maxHp: 6, atk: 2, baseAtk: 2, vision: 7,
      statuses: [], weak: ["fire"], resist: ["frost"], boss: false,
      protocol: "slime", actInterval: 850, actTimer: 400, protoState: {}
    });
    spawnBurst(nx, ny, "#4bc35f", 10);
    setMessage(`${e.name} summons a slimeling!`);
    return true;
  }
  return false;
}

function fireBossNova(e) {
  const arms = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dx, dy] of arms) {
    for (let s = 1; s <= 6; s++) {
      const tx = e.x + dx * s;
      const ty = e.y + dy * s;
      if (!inBounds(tx, ty) || state.map[ty][tx] === 1) break;
      spawnBurst(tx, ty, "#ff5dc1", 7);
      if (state.player.x === tx && state.player.y === ty) {
        const raw = Math.max(3, e.atk);
        const dmg = playerTakeDamage(raw);
        state.lastHitBy = e.name;
        setMessage(`${e.name} nova scorches you for ${dmg}.`);
      }
    }
  }
  doScreenShake(8);
}

function pBoss(e) {
  e.protoState ??= { addTimer: 3500, novaTimer: 4500 };
  const frac = e.hp / e.maxHp;
  const d = distance(e, state.player);

  if (frac <= 0.66 && frac > 0.33 && e.protoState.addTimer <= 0) {
    if (spawnBossAdd(e)) e.protoState.addTimer = 4200;
  }
  if (frac <= 0.33 && e.protoState.novaTimer <= 0) {
    fireBossNova(e);
    e.protoState.novaTimer = 4200;
  }

  if (d === 1) { meleePlayer(e, frac <= 0.33 ? 1.25 : 1); return; }
  if (d <= e.vision) advanceAndStrike(e, frac <= 0.33 ? 1.25 : 1);
}

const HANDLERS = {
  slime: pSlime, goblin: pGoblin, bat: pBat, skeleton: pSkeleton,
  imp: pImp, wolf: pWolf, orc: pOrc, wraith: pWraith, boss: pBoss
};

export function tickEnemies(dt) {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    if (e.protoState) {
      for (const k of Object.keys(e.protoState)) {
        if (typeof e.protoState[k] === "number") e.protoState[k] -= dt;
      }
    }
    if (hasStatus(e, "stun")) { e.actTimer = Math.max(e.actTimer, 300); continue; }
    let slowFactor = 1;
    if (hasStatus(e, "chill")) slowFactor = 1.6;
    e.actTimer -= dt / slowFactor;
    if (e.actTimer <= 0) {
      const handler = HANDLERS[e.protocol] || pGoblin;
      handler(e);
      const jitter = (Math.random() - 0.5) * 120;
      e.actTimer = e.actInterval + jitter;
    }
  }
  clearDeadEnemies();
}
