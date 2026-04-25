import { state } from "./state.js";
import { rnd, pick, distance, setMessage, inBounds, isWalkable } from "./utils.js";
import { srnd, spick } from "./rng.js";
import { damageNearestEnemy, damageAdjacentEnemies, damageEnemy, clearDeadEnemies } from "./combat.js";
import { applyStatus, spawnBurst, doScreenShake } from "./fx.js";
import { openWeaponDiscard } from "./discard.js";
import { chatGroq, getGroqKey } from "./llm.js";

function makeRelicName() {
  const { left, mid, right } = state.runSeedWords;
  return `${spick(left)} ${spick(mid)} ${spick(right)}`;
}

function randomRoomTile() {
  const room = spick(state.rooms);
  return {
    x: srnd(room.x + 1, room.x + room.w - 2),
    y: srnd(room.y + 1, room.y + room.h - 2)
  };
}

// apply(floorLevel) mutates state; makeRelic binds the current floor at drop time
const RELIC_EFFECTS = [
  { desc: "Meteor nearest foe", apply(floorLevel) {
      damageNearestEnemy(8 + floorLevel + state.player.spellPower, "#f9a03f");
    } },
  { desc: "+8 max HP and heal", apply() {
      state.player.maxHp += 8;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 8);
      setMessage("Your life force surges.");
    } },
  { desc: "Full mana +2 max mana", apply() {
      state.player.maxMana += 2;
      state.player.mana = state.player.maxMana;
      setMessage("Mana channels open.");
    } },
  { desc: "+2 permanent attack", apply() {
      state.player.baseAtk += 2;
      recalcAttack();
      setMessage("Your strikes grow deadlier.");
    } },
  { desc: "Blink and shock adjacent", apply(floorLevel) {
      const pos = randomRoomTile();
      state.player.x = pos.x;
      state.player.y = pos.y;
      damageAdjacentEnemies(7 + Math.floor(floorLevel / 2), "#b388ff");
      setMessage("You blink through reality.");
    } },
  { desc: "Freeze every enemy for 10 turns", apply() {
      for (const e of state.enemies) applyStatus(e, "stun", 10, 1);
      doScreenShake(4);
      setMessage("Time crystallizes. All enemies stand still.");
    } },
  { desc: "Scorch all visible foes (burn 3 DMG x 8)", apply(floorLevel) {
      const pow = 3 + Math.floor(floorLevel / 3);
      let hit = 0;
      for (const e of state.enemies) {
        if (distance(e, state.player) > 8) continue;
        applyStatus(e, "burn", 8, pow);
        spawnBurst(e.x, e.y, "#ff7a3a", 6);
        hit++;
      }
      setMessage(hit ? `Pyre-mark scorches ${hit} foes.` : "Nothing in sight to burn.");
    } },
  { desc: "Siphon: 15 DMG to nearest, heal that much", apply() {
      if (!state.enemies.length) { setMessage("No one to siphon from."); return; }
      const t = state.enemies
        .map((e) => ({ e, d: distance(e, state.player) }))
        .sort((a, b) => a.d - b.d)[0].e;
      const dmg = 15;
      damageEnemy(t, dmg, "life");
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + dmg);
      spawnBurst(t.x, t.y, "#84f6a6", 10);
      clearDeadEnemies();
      setMessage(`Siphon: -${dmg} from ${t.name}, +${dmg} HP.`);
    } },
  { desc: "Execute: kill all foes below 30% HP", apply() {
      let killed = 0;
      for (const e of state.enemies) {
        if (e.hp / e.maxHp <= 0.30) {
          e.hp = 0;
          spawnBurst(e.x, e.y, "#ff5dc1", 10);
          killed++;
        }
      }
      clearDeadEnemies();
      setMessage(killed ? `Execute slays ${killed} wounded foes.` : "No target is wounded enough.");
    } },
  { desc: "Mana bloom: +50% max MP, restore full", apply() {
      state.player.maxMana = Math.floor(state.player.maxMana * 1.5);
      state.player.mana = state.player.maxMana;
      setMessage("Your mana well blooms open.");
    } },
  { desc: "+1 permanent spell power, +1 SP", apply() {
      state.player.spellPower += 1;
      state.player.spellPoints += 1;
      setMessage("Your arcane mastery deepens.");
    } },
  { desc: "Aegis: ward 90% for 20 turns", apply() {
      applyStatus(state.player, "ward", 20, 90);
      setMessage("An aegis of light shields you.");
    } },
  { desc: "Crushing bell: stun + 10 DMG to all within 3", apply() {
      let hit = 0;
      for (const e of state.enemies) {
        if (distance(e, state.player) <= 3) {
          damageEnemy(e, 10, "storm");
          applyStatus(e, "stun", 5, 1);
          spawnBurst(e.x, e.y, "#e0c9ff", 8);
          hit++;
        }
      }
      doScreenShake(6);
      clearDeadEnemies();
      setMessage(hit ? `Bell rattles ${hit} nearby.` : "Bell rings hollow.");
    } },
  { desc: "Arrow cache: +20 arrows, +5 SP", apply() {
      state.player.arrows += 20;
      state.player.spellPoints += 5;
      setMessage("A cache of feathers and focus spills out.");
    } }
];

export function makeRelic(floorLevel) {
  const effect = spick(RELIC_EFFECTS);
  return {
    name: makeRelicName(),
    desc: effect.desc,
    use: () => effect.apply(floorLevel)
  };
}

const POTION_RECIPES = {
  heal: () => ({
    name: "Healing Potion",
    desc: "Restore 25 HP on use.",
    use() {
      const heal = 25;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
      setMessage(`Healing Potion restores ${heal} HP.`);
    }
  }),
  mana: () => ({
    name: "Mana Draught",
    desc: "Fully restore mana on use.",
    use() {
      state.player.mana = state.player.maxMana;
      setMessage("Mana Draught refills your pool.");
    }
  }),
  swiftness: () => ({
    name: "Swiftness Elixir",
    desc: "Haste for 14 turns on use.",
    use() {
      applyStatus(state.player, "haste", 14, 1);
      setMessage("Swiftness Elixir quickens your step.");
    }
  }),
  aegis: () => ({
    name: "Aegis Flask",
    desc: "Ward 80% for 12 turns on use.",
    use() {
      applyStatus(state.player, "ward", 12, 80);
      setMessage("Aegis Flask wraps you in shimmering light.");
    }
  }),
  growth: () => ({
    name: "Growth Tonic",
    desc: "Permanently +5 max HP on use.",
    use() {
      state.player.maxHp += 5;
      state.player.hp += 5;
      setMessage("Growth Tonic deepens your vitality.");
    }
  }),
  focus: () => ({
    name: "Focus Draught",
    desc: "Permanently +2 max MP on use.",
    use() {
      state.player.maxMana += 2;
      state.player.mana = state.player.maxMana;
      setMessage("Focus Draught sharpens your mind.");
    }
  })
};

export function makePotion(kind) {
  const make = POTION_RECIPES[kind];
  return make ? make() : null;
}

function findEquippedWeaponObj() {
  return state.player.backpack.find((w) => w.name === state.player.weapon) || null;
}

export function recalcAttack() {
  const weaponBonus = state.player.weaponBonus || 0;
  const enchantBonus = state.player.weaponEnchant?.atkBonus || 0;
  state.player.atk = state.player.baseAtk + weaponBonus + enchantBonus;
}

export function equipWeapon(weapon) {
  state.player.weapon = weapon.name;
  state.player.weaponBonus = weapon.atk;
  state.player.weaponType = weapon.type;
  state.player.weaponEnchant = weapon.enchant || null;
  state.player.maxMana = Math.max(6, state.player.maxMana + weapon.mana);
  state.player.mana = Math.min(state.player.mana, state.player.maxMana);
  recalcAttack();
  setMessage(`Equipped ${weapon.name}.`);
  if (!state.player.backpack.find((w) => w.name === weapon.name)) {
    state.player.backpack.push(weapon);
    openWeaponDiscard();
  }
}

const ENCHANT_FALLBACKS = [
  { name: "Sear",       primitive: "burst", color: "#ff7a3a", status: "burn",  procChance: 0.30 },
  { name: "Frostbite",  primitive: "burst", color: "#7dd3ff", status: "chill", procChance: 0.30 },
  { name: "Stormcall",  primitive: "beam",  color: "#c79bff", status: "shock", procChance: 0.30 },
  { name: "Hunter's Mark", primitive: "aura", color: "#fca5ff", status: "mark",  procChance: 0.45 },
  { name: "Bloodthirst",   primitive: "burst", color: "#ff5566", status: null,    procChance: 0.40 }
];

const ENCHANT_TIERS = {
  minor:     { atkMax: 2, cost: 60,  bonusDmgMax: 1, label: "Minor",     procMax: 0.35,
               abilityCostMax: 3,  abilityPowerMax: 6,  abilityRangeMax: 6 },
  major:     { atkMax: 4, cost: 140, bonusDmgMax: 3, label: "Major",     procMax: 0.50,
               abilityCostMax: 4,  abilityPowerMax: 9,  abilityRangeMax: 8 },
  legendary: { atkMax: 7, cost: 280, bonusDmgMax: 5, label: "Legendary", procMax: 0.65,
               abilityCostMax: 6,  abilityPowerMax: 14, abilityRangeMax: 9 }
};

export function getEnchantTiers() { return ENCHANT_TIERS; }

const ABILITY_TYPES = ["bolt", "aura", "beam", "heal"];

function abilityFallback(tier, primitive, status) {
  const tierMap = {
    minor:     { cost: 2, power: 4, range: 5 },
    major:     { cost: 3, power: 7, range: 6 },
    legendary: { cost: 4, power: 11, range: 7 }
  };
  const t = tierMap[tier];
  const typeFromPrim = { burst: "aura", beam: "bolt", aura: "heal" };
  const type = typeFromPrim[primitive] || "bolt";
  const names = {
    bolt: ["Spark Volley", "Crimson Lash", "Frost Lance", "Storm Dart"],
    aura: ["Radiant Burst", "Cinder Pulse", "Glacial Bloom", "Shock Halo"],
    beam: ["Piercing Ray", "Sun Lance", "Hex Tether", "Wave Cleave"],
    heal: ["Mending Pulse", "Soul Surge", "Verdant Flow", "Astral Mend"]
  };
  return {
    name: pick(names[type]),
    type,
    cost: t.cost,
    power: t.power,
    range: type === "heal" ? 0 : t.range
  };
}

function clampAbility(raw, tier) {
  const t = ENCHANT_TIERS[tier];
  if (!raw || typeof raw !== "object") return abilityFallback(tier, "burst", null);
  const type = ABILITY_TYPES.includes(raw.type) ? raw.type : "bolt";
  return {
    name: typeof raw.name === "string" && raw.name.length < 30 ? raw.name : "Spark Volley",
    type,
    cost: Math.max(1, Math.min(t.abilityCostMax, Math.floor(Number(raw.cost) || 2))),
    power: Math.max(1, Math.min(t.abilityPowerMax, Math.floor(Number(raw.power) || 4))),
    range: Math.max(0, Math.min(t.abilityRangeMax, Math.floor(Number(raw.range) || 5)))
  };
}

function fallbackEnchant(weaponType, tier) {
  const t = ENCHANT_TIERS[tier];
  const base = pick(ENCHANT_FALLBACKS);
  return {
    name: `${base.name} ${weaponType[0].toUpperCase()}${weaponType.slice(1)}`,
    flavor: `A ${tier} ${base.name.toLowerCase()} binding hums on the steel.`,
    atkBonus: rnd(1, t.atkMax),
    bonusDamage: tier === "minor" ? 0 : rnd(0, t.bonusDmgMax),
    status: base.status,
    statusTurns: 4,
    statusPower: tier === "legendary" ? 3 : tier === "major" ? 2 : 1,
    procChance: Math.min(t.procMax, base.procChance),
    color: base.color,
    primitive: base.primitive,
    ability: abilityFallback(tier, base.primitive, base.status)
  };
}

function clampEnchant(raw, weaponType, tier) {
  const t = ENCHANT_TIERS[tier];
  const allowedStatus = ["burn", "chill", "shock", "mark", null];
  const allowedPrim = ["burst", "beam", "aura"];
  const status = allowedStatus.includes(raw.status) ? raw.status : null;
  const primitive = allowedPrim.includes(raw.primitive) ? raw.primitive : "burst";
  const colorOk = typeof raw.color === "string" && /^#[0-9a-fA-F]{6}$/.test(raw.color);
  return {
    name: typeof raw.name === "string" && raw.name.length < 40 ? raw.name : fallbackEnchant(weaponType, tier).name,
    flavor: typeof raw.flavor === "string" && raw.flavor.length < 140 ? raw.flavor : "",
    atkBonus: Math.max(0, Math.min(t.atkMax, Math.floor(Number(raw.atkBonus) || 0))),
    bonusDamage: Math.max(0, Math.min(t.bonusDmgMax, Math.floor(Number(raw.bonusDamage) || 0))),
    status,
    statusTurns: Math.max(1, Math.min(8, Math.floor(Number(raw.statusTurns) || 4))),
    statusPower: Math.max(1, Math.min(4, Math.floor(Number(raw.statusPower) || 1))),
    procChance: Math.max(0.1, Math.min(t.procMax, Number(raw.procChance) || 0.3)),
    color: colorOk ? raw.color : "#ffd166",
    primitive,
    ability: clampAbility(raw.ability, tier)
  };
}

export async function generateAiEnchant({ weaponName, weaponType, tier }) {
  if (!state.aiEnabled || !getGroqKey()) return fallbackEnchant(weaponType, tier);
  const t = ENCHANT_TIERS[tier];
  try {
    const text = await chatGroq({
      prompt: `Return JSON only with keys name, flavor, atkBonus, bonusDamage, status, statusTurns, statusPower, procChance, color, primitive, ability. ` +
              `Design a ${tier} weapon enchant for a fantasy ${weaponType} called "${weaponName}". ` +
              `name: 2-4 words. flavor: <14 words. atkBonus integer 0-${t.atkMax}. bonusDamage integer 0-${t.bonusDmgMax}. ` +
              `status one of "burn"|"chill"|"shock"|"mark"|null. statusTurns 2-6. statusPower 1-${tier === "legendary" ? 3 : 2}. ` +
              `procChance 0.15-${t.procMax}. color "#rrggbb" hex matching the theme. primitive one of "burst"|"beam"|"aura". ` +
              `ability is an object with keys name, type, cost, power, range. ` +
              `ability.name 2-4 words evoking an active spell. ability.type one of "bolt"|"aura"|"beam"|"heal" (bolt=single ranged hit, aura=damage adjacent, beam=chain to up to 3, heal=restore HP). ` +
              `ability.cost integer 1-${t.abilityCostMax} mana. ability.power integer 1-${t.abilityPowerMax}. ability.range integer 0-${t.abilityRangeMax} (use 0 for heal).`,
      json: true,
      maxTokens: 400
    });
    const raw = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return clampEnchant(raw, weaponType, tier);
  } catch {
    return fallbackEnchant(weaponType, tier);
  }
}

export function applyEnchantToEquippedWeapon(enchant) {
  const w = findEquippedWeaponObj();
  if (!w) return false;
  w.enchant = enchant;
  state.player.weaponEnchant = enchant;
  recalcAttack();
  return true;
}

export function fallbackLoot(theme = "wild") {
  const names = ["Storm", "Rune", "Iron", "Moon", "Grave", "Ember"];
  const bases = ["Bow", "Mace", "Glaive", "Sword", "Axe", "Wand"];
  const base = pick(bases);
  return {
    name: `${pick(names)} ${base}`,
    atk: rnd(2, 6),
    mana: rnd(-1, 3),
    type: base.toLowerCase(),
    effectiveAgainst: pick(["slime", "goblin", "skeleton", "orc", theme]),
    animation: pick(["arc slash", "spark burst", "piercing line", "hammer shock"]),
    damageMode: pick(["bleed", "burst", "pierce"])
  };
}

export async function generateAiLoot(theme = "enemy") {
  if (!state.aiEnabled || !getGroqKey()) return fallbackLoot(theme);
  try {
    const text = await chatGroq({
      prompt: `Return JSON only with keys name,atk,mana,type,effectiveAgainst,animation,damageMode. Make one fantasy weapon good against ${theme}. atk integer 1-7, mana integer -2..4.`,
      json: true,
      maxTokens: 200
    });
    const loot = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    if (!loot.name || typeof loot.atk !== "number") throw new Error("bad loot");
    return loot;
  } catch {
    return fallbackLoot(theme);
  }
}
