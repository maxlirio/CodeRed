import { state, ui } from "./state.js";
import { WEAPON_POOL } from "./config.js";
import { pick, setMessage } from "./utils.js";
import { equipWeapon, makeRelic, makePotion, recalcAttack } from "./items.js";
import { SPELL_LIBRARY, rankOf, isSpellForPlayer } from "./spells/index.js";

function addPotion(kind) {
  if (state.player.inventory.length >= 6) { setMessage("Relic slots full — drop one first."); return false; }
  const potion = makePotion(kind);
  if (potion) state.player.inventory.push(potion);
  return true;
}

function buySpellScroll() {
  const atCap = state.player.knownSpells.size >= 6;
  const eligible = SPELL_LIBRARY.filter(isSpellForPlayer);
  const unknown = atCap ? [] : eligible.filter((sp) => !state.player.knownSpells.has(sp.id));
  const rankable = eligible.filter((sp) => state.player.knownSpells.has(sp.id) && rankOf(sp.id) < 3);
  const pool = unknown.length ? unknown : rankable;
  if (!pool.length) { setMessage("Spellbook full and all spells mastered."); return; }
  const picked = pick(pool);
  if (state.player.knownSpells.has(picked.id)) {
    state.player.spellRanks[picked.id] = rankOf(picked.id) + 1;
    setMessage(`${picked.name} ranks up to R${rankOf(picked.id)}!`);
  } else {
    state.player.knownSpells.add(picked.id);
    state.player.spellRanks[picked.id] = 1;
    const slots = state.player.spellSlots;
    const empty = ["z", "x", "c", "v"].find((k) => !slots[k]);
    if (empty) slots[empty] = picked.id;
    setMessage(`Learned ${picked.name}.`);
  }
}

const SHOPS = {
  weapon: {
    title: "BLACKSMITH",
    offers: [
      { name: "Weapon Crate (30g)", cost: 30, buy() { equipWeapon(pick(WEAPON_POOL)); } },
      { name: "Arrow Bundle (15g, +10)", cost: 15, buy() { state.player.arrows += 10; } },
      { name: "Sharpen Blade (20g, +1 ATK)", cost: 20, buy() { state.player.baseAtk += 1; } }
    ]
  },
  alchemist: {
    title: "ALCHEMIST",
    offers: [
      { name: "Healing Potion (12g)", cost: 12, buy() { addPotion("heal"); } },
      { name: "Mana Draught (14g)", cost: 14, buy() { addPotion("mana"); } },
      { name: "Swiftness Elixir (20g)", cost: 20, buy() { addPotion("swiftness"); } },
      { name: "Aegis Flask (22g)", cost: 22, buy() { addPotion("aegis"); } },
      { name: "Growth Tonic (28g)", cost: 28, buy() { addPotion("growth"); } },
      { name: "Focus Draught (24g)", cost: 24, buy() { addPotion("focus"); } }
    ]
  },
  arcanum: {
    title: "ARCANUM",
    offers: [
      { name: "Spell Scroll (26g)", cost: 26, buy: buySpellScroll },
      { name: "+1 Spell Power (30g)", cost: 30, buy() { state.player.spellPower += 1; } }
    ]
  },
  curio: {
    title: "CURIOS",
    offers: [
      { name: "Random Relic (28g)", cost: 28, buy() {
          if (state.player.inventory.length < 6) state.player.inventory.push(makeRelic(state.floor));
          else setMessage("Relic inventory full.");
        } }
    ]
  }
};

let activeShopKind = null;

export function openShop(kind = "weapon") {
  activeShopKind = SHOPS[kind] ? kind : "weapon";
  ui.shopOverlay.classList.remove("hidden");
  renderShop();
}

export function closeShop() {
  state.awaitingShop = false;
  activeShopKind = null;
  ui.shopOverlay.classList.add("hidden");
  setMessage("You step back outside.");
}

export function renderShop() {
  const shop = SHOPS[activeShopKind] || SHOPS.weapon;
  ui.shopGold.textContent = `${shop.title} — Gold: ${state.player.gold}`;
  ui.shopChoices.innerHTML = "";
  for (const offer of shop.offers) {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `<strong>${offer.name}</strong><span>Spend gold for upgrades.</span>`;
    btn.addEventListener("click", () => {
      if (state.player.gold < offer.cost) { setMessage("Not enough gold."); return; }
      state.player.gold -= offer.cost;
      const result = offer.buy();
      if (result === false) {
        state.player.gold += offer.cost;
      } else {
        setMessage(`Purchased ${offer.name}.`);
      }
      recalcAttack();
      renderShop();
    });
    ui.shopChoices.appendChild(btn);
  }
}
