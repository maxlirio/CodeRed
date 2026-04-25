import { state } from "./state.js";
import { maxFloor } from "./config.js";

const overlay = document.getElementById("resultOverlay");
const verdictEl = document.getElementById("resultVerdict");
const nameEl = document.getElementById("resultName");
const classEl = document.getElementById("resultClass");
const epitaphEl = document.getElementById("resultEpitaph");
const gridEl = document.getElementById("resultGrid");
const statsEl = document.getElementById("resultStats");
const newBtn = document.getElementById("playAgain");
const downloadBtn = document.getElementById("downloadHero");

const GLYPH = {
  cleared: "▓",
  boss: "★",
  died: "☠",
  pending: "·"
};

function runName() {
  return state.heroName || "Nameless Wanderer";
}

function epitaph() {
  if (state.won) return `Claimed the depths — all ${maxFloor} floors cleared.`;
  return state.lastKilledBy || `Fell on floor ${state.floor}.`;
}

function buildGrid() {
  const cells = [];
  for (let i = 0; i < maxFloor; i++) {
    const outcome = state.stats.floorLog[i] || "pending";
    cells.push(GLYPH[outcome]);
  }
  return cells.join(" ");
}

export function showResult() {
  verdictEl.textContent = state.won ? "▼ VICTORY ▼" : "▼ RUN ENDED ▼";
  nameEl.textContent = runName();
  classEl.textContent = `the ${state.player.className}`;
  epitaphEl.textContent = epitaph();
  gridEl.textContent = buildGrid();
  statsEl.className = "result-stats chips";
  statsEl.innerHTML = `
    <span class="chip"><b>floor</b>${state.stats.floorsCleared}/${maxFloor}</span>
    <span class="chip"><b>kills</b>${state.stats.kills}</span>
    <span class="chip"><b>bosses</b>${state.stats.bossKills}</span>
    <span class="chip"><b>spells</b>${state.stats.spellsCast}</span>
    <span class="chip"><b>gold</b>${state.stats.goldEarned}g</span>
    <span class="chip"><b>weapon</b>${state.player.weapon}</span>
  `;
  if (downloadBtn) downloadBtn.classList.toggle("hidden", !state.won);
  overlay.classList.remove("hidden");
}

function buildHeroExport() {
  const p = state.player;
  const equipped = (p.backpack || []).find((w) => w.name === p.weapon) || null;
  const spells = [...(p.knownSpells || [])].map((id) => ({
    id,
    rank: (p.spellRanks && p.spellRanks[id]) || 1,
    augments: (p.spellAugments && p.spellAugments[id]) || []
  }));
  return {
    version: 1,
    exported: new Date().toISOString(),
    name: state.heroName || "Nameless Wanderer",
    className: p.className,
    stats: {
      maxHp: p.maxHp,
      maxMana: p.maxMana,
      baseAtk: p.baseAtk,
      spellPower: p.spellPower,
      spellPoints: p.spellPoints || 0,
      arrows: p.arrows || 0
    },
    weapon: equipped ? {
      name: equipped.name,
      type: equipped.type,
      atk: equipped.atk,
      mana: equipped.mana || 0,
      enchant: equipped.enchant || null
    } : null,
    spells,
    run: {
      floorsCleared: state.stats.floorsCleared,
      kills: state.stats.kills,
      bossKills: state.stats.bossKills,
      spellsCast: state.stats.spellsCast,
      goldEarned: state.stats.goldEarned
    }
  };
}

function downloadHero() {
  const data = buildHeroExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (data.name || "hero").replace(/[^a-z0-9_-]+/gi, "_");
  a.href = url;
  a.download = `${safeName}-${data.className || "hero"}.codered.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (downloadBtn) downloadBtn.addEventListener("click", downloadHero);

newBtn.addEventListener("click", () => {
  location.hash = "";
  location.reload();
});
