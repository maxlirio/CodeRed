import { state } from "./state.js";
import { SPELL_BY_ID, SCHOOL_COLORS } from "./config.js";
import { inBounds, isWalkable, enemyAt, distance, lineTiles, setMessage } from "./utils.js";
import {
  spawnBurst, spawnBeam, doScreenShake,
  applyStatus, addFloorEffect, isWallBlocked
} from "./fx.js";
import { damageEnemy, clearDeadEnemies } from "./combat.js";

export function rankOf(id) { return (state.player.spellRanks && state.player.spellRanks[id]) || 1; }

export function spellPowerNow() { return state.player.spellPower + Math.floor(state.floor / 4); }

export function spellRoll() {
  const r = Math.random();
  if (r < 0.08) return { kind: "fizzle", mult: 0 };
  if (r > 0.88) return { kind: "crit",   mult: 1.7 };
  return             { kind: "hit",    mult: 1 };
}

export function spendSpellMana(spell, charged) {
  const cost = Math.ceil(spell.cost * (charged ? 1.5 : 1));
  state.player.mana -= cost;
  return cost;
}

function recLast(id, tx, ty) { state.player.lastOffensive = { id, tx, ty }; }

export function castSpell(spell, tx, ty, { charged = false } = {}) {
  const chargeMul = charged ? 1.5 : 1;
  const rank = rankOf(spell.id);
  const pow = spellPowerNow();

  const roll = spellRoll();
  if (roll.kind === "fizzle") {
    setMessage(`${spell.name} fizzles. Half mana refunded.`);
    spawnBurst(state.player.x, state.player.y, "#666", 8);
    state.player.mana += Math.ceil(spell.cost * (charged ? 1.5 : 1) * 0.5);
    return { acted: true, offensive: false };
  }
  const isCrit = roll.kind === "crit";
  const critMul = isCrit ? 1.7 : 1;
  const baseDmg = Math.floor((7 + pow + rank * 2) * chargeMul * critMul);
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS[spell.school], 6 + (charged ? 8 : 0));
  if (charged) doScreenShake(4);
  if (isCrit) doScreenShake(3);

  switch (spell.id) {
    case "bolt": {
      const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
      let hit = false;
      const pierces = rank >= 2;
      for (const tile of line) {
        if (!inBounds(tile.x, tile.y) || state.map[tile.y][tile.x] === 1 || isWallBlocked(tile.x, tile.y)) break;
        const enemy = enemyAt(tile.x, tile.y);
        spawnBeam(state.player.x, state.player.y, tile.x, tile.y, SCHOOL_COLORS.storm);
        if (enemy) {
          const dealt = damageEnemy(enemy, baseDmg, spell.school);
          applyStatus(enemy, "shock", 2, 1);
          if (isCrit && rank >= 3) applyStatus(enemy, "stun", 1, 1);
          setMessage(`Arc Bolt hits ${enemy.name} for ${dealt}${isCrit ? " (crit!)" : ""}.`);
          hit = true;
          if (!pierces) break;
        }
      }
      clearDeadEnemies();
      if (!hit) { setMessage("Arc Bolt crackles into stone."); return { acted: false }; }
      recLast("bolt", tx, ty); return { acted: true, offensive: true };
    }
    case "chain": {
      const n = 3 + (rank - 1);
      const targets = state.enemies
        .map((e) => ({ e, d: distance(e, state.player) }))
        .sort((a, b) => a.d - b.d).slice(0, n).map((v) => v.e);
      if (!targets.length) { setMessage("No targets for Chain Spark."); return { acted: false }; }
      let prev = state.player;
      targets.forEach((t, i) => {
        const dmg = Math.floor(baseDmg * Math.pow(0.8, i));
        damageEnemy(t, dmg, spell.school);
        applyStatus(t, "shock", 2, 1);
        spawnBeam(prev.x, prev.y, t.x, t.y, SCHOOL_COLORS.storm);
        prev = t;
      });
      clearDeadEnemies();
      setMessage(`Chain Spark arcs across ${targets.length} foes.`);
      recLast("chain", state.player.x, state.player.y); return { acted: true, offensive: true };
    }
    case "nova": {
      const radius = rank >= 3 ? 2 : 1;
      let hit = 0;
      for (let yy = ty - radius; yy <= ty + radius; yy++) {
        for (let xx = tx - radius; xx <= tx + radius; xx++) {
          if (!inBounds(xx, yy) || state.map[yy][xx] === 1) continue;
          addFloorEffect(xx, yy, "burn", 3, 2 + Math.floor(pow / 3));
          const e = enemyAt(xx, yy);
          if (e) { damageEnemy(e, baseDmg, spell.school); applyStatus(e, "burn", 3, 2); hit++; }
          spawnBurst(xx, yy, SCHOOL_COLORS.fire, 6);
        }
      }
      doScreenShake(6);
      clearDeadEnemies();
      setMessage(`Flame Nova scorches ${hit} foes.`);
      recLast("nova", tx, ty); return { acted: true, offensive: true };
    }
    case "ember": {
      if (!inBounds(tx, ty) || state.map[ty][tx] === 1) { setMessage("Can't plant a mine there."); return { acted: false }; }
      addFloorEffect(tx, ty, "mine", 20, 1);
      spawnBurst(tx, ty, SCHOOL_COLORS.fire, 10);
      setMessage("Ember Mine primed.");
      recLast("ember", tx, ty); return { acted: true, offensive: true };
    }
    case "meteor": {
      const radius = rank >= 2 ? 2 : 1;
      const dmg = Math.floor(baseDmg * 1.4);
      let hit = 0;
      for (let yy = ty - radius; yy <= ty + radius; yy++) {
        for (let xx = tx - radius; xx <= tx + radius; xx++) {
          if (!inBounds(xx, yy) || state.map[yy][xx] === 1) continue;
          addFloorEffect(xx, yy, "burn", 4, 3);
          spawnBurst(xx, yy, "#ff4a22", 10);
          const e = enemyAt(xx, yy);
          if (e) { damageEnemy(e, dmg, spell.school); applyStatus(e, "burn", 4, 3); hit++; }
        }
      }
      doScreenShake(12);
      clearDeadEnemies();
      setMessage(`Meteor craters ${hit} foes!`);
      recLast("meteor", tx, ty); return { acted: true, offensive: true };
    }
    case "frost": {
      const line = lineTiles(state.player.x, state.player.y, tx, ty).slice(1);
      let hit = 0;
      for (const tile of line) {
        if (!inBounds(tile.x, tile.y) || state.map[tile.y][tile.x] === 1 || isWallBlocked(tile.x, tile.y)) break;
        const enemy = enemyAt(tile.x, tile.y);
        if (enemy) {
          damageEnemy(enemy, baseDmg, spell.school);
          applyStatus(enemy, "chill", 3, 1);
          spawnBurst(enemy.x, enemy.y, SCHOOL_COLORS.frost, 8);
          hit++;
        }
      }
      spawnBeam(state.player.x, state.player.y, tx, ty, SCHOOL_COLORS.frost);
      clearDeadEnemies();
      if (!hit) { setMessage("Frost Lance glides past."); return { acted: false }; }
      setMessage(`Frost Lance pierces ${hit} foes.`);
      recLast("frost", tx, ty); return { acted: true, offensive: true };
    }
    case "pull": {
      const enemy = enemyAt(tx, ty);
      if (!enemy) { setMessage("No target to pull."); return { acted: false }; }
      for (let i = 0; i < 3; i++) {
        const dxm = Math.abs(state.player.x - enemy.x);
        const dym = Math.abs(state.player.y - enemy.y);
        let nx = enemy.x, ny = enemy.y;
        if (dxm >= dym) nx += Math.sign(state.player.x - enemy.x);
        else ny += Math.sign(state.player.y - enemy.y);
        if ((nx === state.player.x && ny === state.player.y) || !isWalkable(nx, ny) || enemyAt(nx, ny) || isWallBlocked(nx, ny)) break;
        enemy.x = nx; enemy.y = ny;
      }
      applyStatus(enemy, "chill", 2, 1);
      spawnBeam(state.player.x, state.player.y, enemy.x, enemy.y, SCHOOL_COLORS.frost);
      setMessage(`Tide Pull drags ${enemy.name} in.`);
      recLast("pull", enemy.x, enemy.y); return { acted: true, offensive: true };
    }
    case "mend": {
      const heal = Math.floor((8 + pow + rank * 3) * chargeMul * critMul);
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
      applyStatus(state.player, "regen", 2 + rank, 2 + Math.floor(pow / 2));
      spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.life, 14);
      setMessage(`Mend heals ${heal}.`);
      return { acted: true, offensive: false };
    }
    case "drain": {
      const near = state.enemies.filter((e) => distance(e, state.player) <= 1);
      if (!near.length) { setMessage("No adjacent foes to drain."); return { acted: false }; }
      let total = 0;
      for (const e of near) {
        const dealt = damageEnemy(e, baseDmg, spell.school);
        total += dealt;
        spawnBurst(e.x, e.y, SCHOOL_COLORS.life, 8);
      }
      const heal = Math.floor(total * 0.6);
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
      clearDeadEnemies();
      setMessage(`Vampire Touch: ${total} dmg, heal ${heal}.`);
      recLast("drain", state.player.x, state.player.y); return { acted: true, offensive: true };
    }
    case "thorn": {
      const dxm = tx - state.player.x;
      const dym = ty - state.player.y;
      const tiles = Math.abs(dxm) >= Math.abs(dym)
        ? [{ x: tx, y: ty - 1 }, { x: tx, y: ty }, { x: tx, y: ty + 1 }]
        : [{ x: tx - 1, y: ty }, { x: tx, y: ty }, { x: tx + 1, y: ty }];
      let placed = 0;
      for (const t of tiles) {
        if (isWalkable(t.x, t.y) && !enemyAt(t.x, t.y) && !(state.player.x === t.x && state.player.y === t.y)) {
          addFloorEffect(t.x, t.y, "wall", 5 + rank, 1);
          spawnBurst(t.x, t.y, SCHOOL_COLORS.life, 6);
          placed++;
        }
      }
      if (!placed) { setMessage("Nothing to root here."); return { acted: false }; }
      setMessage(`Thornwall roots ${placed} tiles.`);
      return { acted: true, offensive: false };
    }
    case "blink": {
      if (!inBounds(tx, ty) || state.map[ty][tx] === 1 || enemyAt(tx, ty) || isWallBlocked(tx, ty)) { setMessage("Can't blink there."); return { acted: false }; }
      spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.arcane, 12);
      state.player.x = tx; state.player.y = ty;
      spawnBurst(tx, ty, SCHOOL_COLORS.arcane, 14);
      doScreenShake(3);
      setMessage("You blink.");
      return { acted: true, offensive: false };
    }
    case "echo": {
      const last = state.player.lastOffensive;
      if (!last || !SPELL_BY_ID[last.id]) { setMessage("No spell to echo."); return { acted: false }; }
      const prev = SPELL_BY_ID[last.id];
      setMessage(`Echo: ${prev.name}.`);
      return castSpell(prev, last.tx, last.ty, { charged });
    }
  }
  return { acted: false };
}
