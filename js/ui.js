import { state, ui } from "./state.js";
import { CLASS_OPTIONS, SCHOOL_COLORS, STATUS_DEFS } from "./config.js";
import { SPELL_BY_ID, rankOf } from "./spells/index.js";
import { drawPortrait } from "./render.js";
import { chooseClass } from "./turn.js";

const heroNameInput = document.getElementById("heroName");
const rerollNameBtn = document.getElementById("rerollName");
const heroDisplay = document.getElementById("heroDisplay");

const HERO_FIRST_NAMES = [
  "Edward", "Mira", "Gareth", "Elena", "Finn", "Aurora", "Kael", "Ivy",
  "Arthur", "Lyra", "Cedric", "Nora", "Dorian", "Selene", "Owen", "Freya",
  "Roland", "Isolde", "Alistair", "Mabel", "Percival", "Rowan", "Tristan", "Eira",
  "Bastian", "Saoirse", "Caspian", "Astrid", "Oswin", "Maren", "Leif", "Sigrid",
  "Henry", "Clara", "Thomas", "Rosalind", "Marcus", "Juno", "Bertram", "Lena",
  "Desmond", "Imogen", "Philip", "Cordelia", "Gideon", "Beatrice", "Silas", "Margot"
];

const HERO_SURNAMES = [
  "Ashford", "Blackwood", "Crane", "Dunmore", "Everly", "Falk", "Graves",
  "Hale", "Ironwood", "Jessup", "Kellen", "Locke", "Moore", "Nash",
  "Orrick", "Pike", "Quinn", "Ravenna", "Stone", "Thorne", "Vale",
  "Wyatt", "Hollis", "Briggs", "Clay", "Drake", "Marsh", "Weller",
  "Sinclair", "Holloway", "Fenwick", "Garrow", "Monroe", "Keene"
];

function suggestName() {
  const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${r(HERO_FIRST_NAMES)} ${r(HERO_SURNAMES)}`;
}

function renderSlots() {
  const slots = state.player.spellSlots;
  const maxSlots = state.player.maxSpellSlots || 4;
  const keys = ["z", "x", "c", "v", "q", "e"].slice(0, maxSlots);
  return keys.map((k) => {
    const id = slots[k];
    if (!id) return `<span style="color:#6b6b8f">[${k.toUpperCase()}] -</span>`;
    const sp = SPELL_BY_ID[id];
    const r = rankOf(id);
    const col = SCHOOL_COLORS[sp.school];
    return `<span style="color:${col}">[${k.toUpperCase()}] ${sp.name} R${r} (${sp.cost}MP)</span>`;
  }).join(" · ");
}

function syncTouchSlotLabels() {
  const slots = state.player.spellSlots;
  for (const k of ["z", "x", "c", "v"]) {
    const btn = document.getElementById(`touch${k.toUpperCase()}`);
    if (!btn) continue;
    const id = slots[k];
    if (!id) { btn.textContent = `${k.toUpperCase()} —`; continue; }
    const sp = SPELL_BY_ID[id];
    btn.textContent = `${k.toUpperCase()} ${sp.name.split(" ")[0]} ${sp.cost}MP`;
  }
}

function renderPlayerStatuses() {
  return (state.player.statuses || [])
    .map((s) => `<span style="color:${STATUS_DEFS[s.kind].color}">${STATUS_DEFS[s.kind].tag}${s.turns}</span>`)
    .join(" ");
}

export function updateUi() {
  if (heroDisplay) heroDisplay.textContent = state.heroName || "-";
  ui.className.textContent = state.player.className || "-";
  ui.weapon.textContent = `${state.player.weapon || "-"} (${state.player.weaponType || "none"})`;
  ui.hp.textContent = `${state.player.hp}/${state.player.maxHp}`;
  ui.mana.textContent = `${state.player.mana}/${state.player.maxMana}`;
  ui.atk.textContent = `${state.player.atk} (+${state.player.spellPower} spell)`;
  ui.floor.textContent = state.floor === 0 ? "Town" : state.floor;
  ui.gold.textContent = state.player.gold;
  ui.enemies.textContent = state.enemies.length;
  ui.bossStatus.textContent = state.bossAlive ? "Alive" : "Cleared";
  ui.inventory.innerHTML = state.player.inventory.length
    ? `Relics: ${state.player.inventory.map((item, i) => `[${i + 1}] ${item.name} — ${item.desc}`).join("<br>")}`
    : "Relics: empty. Find magenta drops.";

  const statuses = renderPlayerStatuses();
  ui.spells.innerHTML = `Slots: ${renderSlots()} · Arrows: ${state.player.arrows}${statuses ? ` · ${statuses}` : ""} · Shift+click = CHARGED`;
  syncTouchSlotLabels();

  if (state.aimMode && state.mouseTile) {
    ui.narration.textContent = `Aim: ${state.aimMode.name}${state.aimMode.charged ? " (CHARGED)" : ""} — click tile ${state.mouseTile.x},${state.mouseTile.y}.`;
  }
  drawPortrait();
}

export function renderClassChoices() {
  heroNameInput.value = suggestName();
  rerollNameBtn.addEventListener("click", () => { heroNameInput.value = suggestName(); });

  ui.classChoices.innerHTML = "";
  for (const c of CLASS_OPTIONS) {
    const btn = document.createElement("button");
    btn.className = "choice";
    const starts = (c.startSpells || [])
      .map((id) => SPELL_BY_ID[id])
      .filter(Boolean)
      .map((s) => `<span style="color:${SCHOOL_COLORS[s.school]}">${s.name}</span>`)
      .join(" · ");
    const desc = c.desc ? `<span style="color:var(--ink-dim);font-style:italic">${c.desc}</span>` : "";
    btn.innerHTML = `<strong>${c.name}</strong>${desc}<span>HP ${c.hp}, MP ${c.mana}, ATK ${c.atk}, Weapon ${c.weapon}</span>${starts ? `<span>${starts}</span>` : ""}`;
    btn.addEventListener("click", () => {
      const heroName = heroNameInput.value.trim() || suggestName();
      chooseClass(c, { heroName });
    });
    ui.classChoices.appendChild(btn);
  }
}
