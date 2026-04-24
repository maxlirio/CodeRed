import { state } from "./state.js";
import { rnd, pick, distance, setMessage, inBounds, isWalkable } from "./utils.js";
import { srnd, spick } from "./rng.js";
import { damageNearestEnemy, damageAdjacentEnemies, damageEnemy, clearDeadEnemies } from "./combat.js";
import { applyStatus, spawnBurst, doScreenShake } from "./fx.js";
import { openWeaponDiscard } from "./discard.js";

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

export function recalcAttack() {
  const weaponBonus = state.player.weaponBonus || 0;
  state.player.atk = state.player.baseAtk + weaponBonus;
}

export function equipWeapon(weapon) {
  state.player.weapon = weapon.name;
  state.player.weaponBonus = weapon.atk;
  state.player.weaponType = weapon.type;
  state.player.maxMana = Math.max(6, state.player.maxMana + weapon.mana);
  state.player.mana = Math.min(state.player.mana, state.player.maxMana);
  recalcAttack();
  setMessage(`Equipped ${weapon.name}.`);
  if (!state.player.backpack.find((w) => w.name === weapon.name)) {
    state.player.backpack.push(weapon);
    openWeaponDiscard();
  }
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
  const apiKey = localStorage.getItem("pixelRogueOpenAIKey");
  if (!state.aiEnabled || !apiKey) return fallbackLoot(theme);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Return JSON only with keys name,atk,mana,type,effectiveAgainst,animation,damageMode. Make one fantasy weapon good against ${theme}. atk integer 1-7, mana integer -2..4.`,
        max_output_tokens: 140
      })
    });
    if (!response.ok) throw new Error("loot failed");
    const text = (await response.json()).output_text || "";
    const loot = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    if (!loot.name || typeof loot.atk !== "number") throw new Error("bad loot");
    return loot;
  } catch {
    return fallbackLoot(theme);
  }
}
