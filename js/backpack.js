import { state, ui } from "./state.js";
import { SCHOOL_COLORS } from "./config.js";
import { equipWeapon, fallbackLoot } from "./items.js";
import { SPELL_LIBRARY, rankOf } from "./spells/index.js";

function sectionHeader(text, marginTop = "") {
  const h = document.createElement("div");
  h.style.gridColumn = "1/-1";
  h.style.color = "#b8b5e9";
  if (marginTop) h.style.marginTop = marginTop;
  h.textContent = text;
  return h;
}

function describeAbility(a) {
  const where = a.type === "heal" ? "self" : `nearest in ${a.range || 5}`;
  const verb = a.type === "heal" ? `heal ${a.power}` :
               a.type === "aura" ? `${a.power} dmg adjacent` :
               a.type === "beam" ? `chain ${a.power} dmg, up to 3 foes` :
               `${a.power} dmg, ${where}`;
  return `${verb} · ${a.cost}MP`;
}

function describeProc(e) {
  const parts = [];
  if (e.bonusDamage) parts.push(`+${e.bonusDamage} on-hit`);
  if (e.status) parts.push(`${Math.round(e.procChance * 100)}% ${e.status} ${e.statusTurns}t`);
  else if (!e.bonusDamage) parts.push(`${Math.round(e.procChance * 100)}% proc`);
  return parts.join(" · ");
}

function renderWeapons() {
  const items = state.player.backpack.length ? state.player.backpack : [fallbackLoot("starter")];
  for (const item of items) {
    const btn = document.createElement("button");
    btn.className = "choice";
    const e = item.enchant;
    const totalAtk = (item.atk || 0) + (e?.atkBonus || 0);
    let html = `<strong>${item.name}${e ? ` <span style="color:${e.color}">✦ ${e.name}</span>` : ""}</strong>`;
    html += `<span>${item.type} · ATK +${totalAtk}${e?.atkBonus ? ` (${item.atk}+${e.atkBonus})` : ""} · Mana ${item.mana} · Good vs ${item.effectiveAgainst || "any"}</span>`;
    if (e) {
      if (e.flavor) html += `<span style="font-style:italic;color:var(--ink-dim)">${e.flavor}</span>`;
      const proc = describeProc(e);
      if (proc) html += `<span>On hit: ${proc}</span>`;
      if (e.ability) html += `<span style="color:${e.color}">[J] ${e.ability.name} — ${describeAbility(e.ability)}</span>`;
    }
    btn.innerHTML = html;
    btn.addEventListener("click", () => {
      equipWeapon(item);
      ui.backpackOverlay.classList.add("hidden");
      state.backpackOpen = false;
    });
    ui.backpackChoices.appendChild(btn);
  }
}

function unbindSpell(spellId) {
  const slots = state.player.spellSlots;
  for (const kk of Object.keys(slots)) if (slots[kk] === spellId) slots[kk] = null;
}

function renderSpellRow(sp) {
  const row = document.createElement("div");
  row.className = "choice";
  row.style.cursor = "default";
  const rank = rankOf(sp.id);
  const slots = state.player.spellSlots;
  const boundKey = Object.keys(slots).find((k) => slots[k] === sp.id);
  row.innerHTML = `<strong style="color:${SCHOOL_COLORS[sp.school]}">${sp.name} R${rank} <span style="color:#b8b5e9">(${sp.school}, ${sp.cost} MP)</span></strong><span>${sp.desc}</span>`;

  const btnRow = document.createElement("div");
  btnRow.style.marginTop = "4px";
  btnRow.style.display = "flex";
  btnRow.style.gap = "4px";
  btnRow.style.flexWrap = "wrap";

  const maxSlots = state.player.maxSpellSlots || 4;
  const slotKeys = ["z", "x", "c", "v", "q", "e"].slice(0, maxSlots);
  for (const k of slotKeys) {
    const b = document.createElement("button");
    b.className = "choice";
    b.style.padding = "4px 8px";
    b.style.fontSize = "11px";
    const isBound = boundKey === k;
    b.textContent = isBound ? `[${k.toUpperCase()}]*` : k.toUpperCase();
    if (isBound) b.style.borderColor = SCHOOL_COLORS[sp.school];
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      unbindSpell(sp.id);
      state.player.spellSlots[k] = sp.id;
      renderBackpack();
    });
    btnRow.appendChild(b);
  }

  const clear = document.createElement("button");
  clear.className = "choice";
  clear.style.padding = "4px 8px";
  clear.style.fontSize = "11px";
  clear.textContent = "—";
  clear.title = "Unassign";
  clear.addEventListener("click", (ev) => {
    ev.stopPropagation();
    unbindSpell(sp.id);
    renderBackpack();
  });
  btnRow.appendChild(clear);

  if (rank < 3) {
    const upgrade = document.createElement("button");
    upgrade.className = "choice";
    upgrade.style.padding = "4px 8px";
    upgrade.style.fontSize = "11px";
    const canAfford = state.player.spellPoints > 0;
    upgrade.textContent = `Upgrade (1 SP)`;
    upgrade.style.opacity = canAfford ? "1" : "0.4";
    upgrade.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (state.player.spellPoints <= 0) return;
      state.player.spellPoints -= 1;
      state.player.spellRanks[sp.id] = rank + 1;
      renderBackpack();
    });
    btnRow.appendChild(upgrade);
  }

  row.appendChild(btnRow);
  return row;
}

export function renderBackpack() {
  ui.backpackChoices.innerHTML = "";
  ui.backpackChoices.appendChild(sectionHeader("— Weapons —"));
  renderWeapons();
  ui.backpackChoices.appendChild(sectionHeader(`— Spells (${state.player.spellPoints} SP to spend) —`, "6px"));

  const known = SPELL_LIBRARY.filter((sp) => state.player.knownSpells.has(sp.id));
  for (const sp of known) ui.backpackChoices.appendChild(renderSpellRow(sp));
}
