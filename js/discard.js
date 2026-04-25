import { state, ui } from "./state.js";
import { SCHOOL_COLORS } from "./config.js";
import { SPELL_BY_ID, rankOf } from "./spells/index.js";
import { setMessage } from "./utils.js";

function showOverlay(message, choices) {
  ui.discardMessage.textContent = message;
  ui.discardChoices.innerHTML = "";
  for (const c of choices) ui.discardChoices.appendChild(c);
  ui.discardOverlay.classList.remove("hidden");
  state.discardOpen = true;
}

function closeOverlay() {
  ui.discardOverlay.classList.add("hidden");
  state.discardOpen = false;
}

export function openWeaponDiscard() {
  const cap = state.player.maxWeapons || 3;
  if (state.player.backpack.length <= cap) return;

  const choices = state.player.backpack.map((w, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    const isEquipped = w.name === state.player.weapon;
    btn.innerHTML = `<strong>${w.name}${isEquipped ? " (equipped)" : ""}</strong><span>${w.type || "?"} · ATK +${w.atk || 0} · Mana ${w.mana || 0}</span>`;
    btn.addEventListener("click", () => {
      state.player.backpack.splice(i, 1);
      setMessage(`Dropped ${w.name}.`);
      closeOverlay();
      if (state.player.backpack.length > cap) openWeaponDiscard();
      if (isEquipped && state.player.backpack.length > 0) {
        const next = state.player.backpack[0];
        state.player.weapon = next.name;
        state.player.weaponBonus = next.atk;
        state.player.weaponType = next.type;
        state.player.weaponEnchant = next.enchant || null;
      }
    });
    return btn;
  });
  showOverlay(`Weapons full (cap ${cap}). Discard one.`, choices);
}

export function openSpellDiscard() {
  const cap = 6;
  if (state.player.knownSpells.size <= cap) return;

  const choices = [];
  for (const id of state.player.knownSpells) {
    const sp = SPELL_BY_ID[id];
    if (!sp) continue;
    const btn = document.createElement("button");
    btn.className = "choice";
    const r = rankOf(id);
    btn.innerHTML = `<strong style="color:${SCHOOL_COLORS[sp.school]}">${sp.name} R${r}</strong><span>${sp.desc}</span>`;
    btn.addEventListener("click", () => {
      state.player.knownSpells.delete(id);
      delete state.player.spellRanks[id];
      for (const k of Object.keys(state.player.spellSlots)) {
        if (state.player.spellSlots[k] === id) state.player.spellSlots[k] = null;
      }
      setMessage(`Forgot ${sp.name}.`);
      closeOverlay();
      if (state.player.knownSpells.size > cap) openSpellDiscard();
    });
    choices.push(btn);
  }
  showOverlay(`Spellbook full (cap ${cap}). Forget one.`, choices);
}
