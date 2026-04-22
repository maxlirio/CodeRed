import { state } from "./state.js";
import { STATUS_DEFS } from "./config.js";
import { rnd, distance, inBounds, enemyAt, lineTiles, setMessage } from "./utils.js";
import {
  spawnBurst, spawnBeam, doScreenShake,
  hasStatus, applyStatus, removeStatus, addFloorEffect
} from "./fx.js";
import { narrateCombat } from "./ai.js";
import { openShop } from "./shop.js";

export function rollHit(baseDamage) {
  const r = Math.random();
  if (r < 0.12) return { type: "miss", damage: 0 };
  if (r > 0.9) return { type: "crit", damage: Math.floor(baseDamage * 1.8) };
  return { type: "hit", damage: baseDamage };
}

export function schoolMultiplier(enemy, school) {
  let m = 1;
  if (enemy.weak && enemy.weak.includes(school)) m *= 1.5;
  if (enemy.resist && enemy.resist.includes(school)) m *= 0.5;
  return m;
}

export function damageEnemy(enemy, amount, school) {
  let m = schoolMultiplier(enemy, school);
  let shatter = false;
  if (hasStatus(enemy, "chill") && (school === "frost" || school === "storm" || school === "fire")) {
    m *= 1.5; removeStatus(enemy, "chill"); shatter = true;
    spawnBurst(enemy.x, enemy.y, "#cdeaff", 14);
  }
  if (school === "storm" && hasStatus(enemy, "burn")) {
    for (const n of state.enemies) if (n !== enemy && distance(n, enemy) <= 1) applyStatus(n, "shock", 2, 1);
    spawnBurst(enemy.x, enemy.y, "#ffffff", 8);
  }
  const dealt = Math.max(0, Math.floor(amount * m));
  enemy.hp -= dealt;
  if (shatter) setMessage(`SHATTER! ${enemy.name} takes ${dealt} ${school}.`);
  return dealt;
}

export function clearDeadEnemies() {
  let killedBoss = false;
  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.hp > 0) return true;
    if (enemy.boss) { killedBoss = true; state.stats.bossKills += 1; }
    state.stats.kills += 1;
    const gold = enemy.boss ? rnd(18, 30) : rnd(2, 7);
    state.player.gold += gold;
    state.stats.goldEarned += gold;
    spawnBurst(enemy.x, enemy.y, enemy.boss ? "#ff5dc1" : "#ffd166", 12);
    return false;
  });
  if (killedBoss) {
    state.bossAlive = false;
    state.awaitingShop = true;
    openShop();
    setMessage("The boss falls. A merchant appears.");
    narrateCombat("The floor boss crashes down and the crowd gasps in awe.");
  }
}

export function playerAttack(enemy) {
  const rolled = rollHit(rnd(state.player.atk - 1, state.player.atk + 3));
  const dmg = rolled.damage;
  enemy.hp -= Math.max(0, dmg);
  spawnBurst(enemy.x, enemy.y, "#ff758f", 9);
  if (rolled.type === "miss") setMessage("You miss!");
  if (rolled.type === "crit") setMessage(`Critical hit! ${dmg} damage.`);
  if (enemy.hp <= 0) {
    const gold = enemy.boss ? rnd(18, 30) : rnd(3, 8);
    state.player.gold += gold;
    state.stats.goldEarned += gold;
    state.stats.kills += 1;
    if (enemy.boss) {
      state.stats.bossKills += 1;
      setMessage(`You slay ${enemy.name}, floor boss!`);
      narrateCombat(`Boss ${enemy.name} collapses after a brutal strike.`);
      state.bossAlive = false;
      state.awaitingShop = true;
      state.enemies = state.enemies.filter((e) => e !== enemy);
      openShop();
      return;
    }
    state.enemies = state.enemies.filter((e) => e !== enemy);
    setMessage(`You defeat a ${enemy.type}.`);
    narrateCombat(`You dropped a ${enemy.type} with a clean finishing blow.`);
  } else {
    if (rolled.type !== "miss") setMessage(`You hit ${enemy.name} for ${dmg}.`);
    narrateCombat(`You carve into ${enemy.name} for ${dmg} damage.`);
  }
}

export function rangedAttackAt(tx, ty) {
  if (state.player.arrows <= 0) {
    setMessage("No arrows left.");
    return false;
  }
  const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
  for (const tile of line) {
    if (!inBounds(tile.x, tile.y) || state.map[tile.y][tile.x] === 1) break;
    const enemy = enemyAt(tile.x, tile.y);
    if (enemy) {
      state.player.arrows -= 1;
      const rolled = rollHit(rnd(state.player.atk + 1, state.player.atk + 4));
      const dmg = rolled.damage;
      enemy.hp -= dmg;
      spawnBeam(state.player.x, state.player.y, tile.x, tile.y, "#ffd166");
      setMessage(`Arrow hits ${enemy.name} for ${dmg}.`);
      narrateCombat(`Your arrow whistles through the dark and strikes ${enemy.name}.`);
      clearDeadEnemies();
      return true;
    }
  }
  state.player.arrows -= 1;
  setMessage("Your arrow misses and shatters on stone.");
  return true;
}

export function damageNearestEnemy(amount, color) {
  if (!state.enemies.length) {
    setMessage("No enemy for that spell.");
    return false;
  }
  const target = state.enemies
    .map((enemy) => ({ enemy, dist: distance(enemy, state.player) }))
    .sort((a, b) => a.dist - b.dist)[0].enemy;
  target.hp -= amount;
  spawnBeam(state.player.x, state.player.y, target.x, target.y, color);
  setMessage(`${target.name} takes ${amount} magic damage.`);
  narrateCombat(`A spell slams ${target.name} for ${amount} crackling damage.`);
  clearDeadEnemies();
  return true;
}

export function damageAdjacentEnemies(amount, color) {
  const nearby = state.enemies.filter((enemy) => distance(enemy, state.player) <= 1);
  if (!nearby.length) {
    setMessage("No nearby enemies.");
    return false;
  }
  for (const enemy of nearby) {
    enemy.hp -= amount;
    spawnBurst(enemy.x, enemy.y, color, 8);
  }
  setMessage(`Nova hits ${nearby.length} foes.`);
  narrateCombat(`Your nova explodes across ${nearby.length} nearby enemies.`);
  clearDeadEnemies();
  return true;
}

export function tickStatuses(t) {
  if (!t.statuses || !t.statuses.length) return;
  for (const s of t.statuses) {
    if (s.kind === "burn") { t.hp -= s.power; spawnBurst(t.x, t.y, STATUS_DEFS.burn.color, 3); }
    if (s.kind === "regen" && t === state.player) {
      t.hp = Math.min(t.maxHp, t.hp + s.power);
      spawnBurst(t.x, t.y, STATUS_DEFS.regen.color, 3);
    }
    s.turns -= 1;
  }
  t.statuses = t.statuses.filter((s) => s.turns > 0);
}

export function tickFloorEffects() {
  for (const f of state.floorEffects) {
    if (f.kind === "burn") {
      const e = enemyAt(f.x, f.y);
      if (e) { e.hp -= f.power; applyStatus(e, "burn", 2, f.power); spawnBurst(f.x, f.y, STATUS_DEFS.burn.color, 2); }
      if (state.player.x === f.x && state.player.y === f.y) {
        state.player.hp -= f.power; spawnBurst(f.x, f.y, STATUS_DEFS.burn.color, 2);
      }
    }
    if (f.kind === "mine") {
      const e = enemyAt(f.x, f.y);
      const onMine = e || (state.player.x === f.x && state.player.y === f.y);
      if (onMine) triggerMine(f);
    }
    f.turns -= 1;
  }
  state.floorEffects = state.floorEffects.filter((f) => f.turns > 0);
}

export function triggerMine(f) {
  const pow = state.player.spellPower + Math.floor(state.floor / 4);
  spawnBurst(f.x, f.y, "#ff7a3a", 16);
  for (let yy = f.y - 1; yy <= f.y + 1; yy++) {
    for (let xx = f.x - 1; xx <= f.x + 1; xx++) {
      if (!inBounds(xx, yy) || state.map[yy][xx] === 1) continue;
      addFloorEffect(xx, yy, "burn", 3, 2);
      const e = enemyAt(xx, yy);
      if (e) { damageEnemy(e, 6 + pow, "fire"); applyStatus(e, "burn", 3, 2); }
    }
  }
  f.turns = 0;
  clearDeadEnemies();
  doScreenShake(6);
}
