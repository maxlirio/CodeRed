import { state } from "./state.js";
import { maxFloor } from "./config.js";

const overlay = document.getElementById("resultOverlay");
const verdictEl = document.getElementById("resultVerdict");
const nameEl = document.getElementById("resultName");
const classEl = document.getElementById("resultClass");
const epitaphEl = document.getElementById("resultEpitaph");
const gridEl = document.getElementById("resultGrid");
const statsEl = document.getElementById("resultStats");
const copyBtn = document.getElementById("copyShare");
const newBtn = document.getElementById("playAgain");
const replayBtn = document.getElementById("replaySeed");

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

function shareUrl() {
  const params = new URLSearchParams();
  if (state.seed) params.set("seed", state.seed);
  if (state.heroName) params.set("name", state.heroName);
  if (state.player.className) params.set("class", state.player.className);
  const hash = params.toString();
  return `${location.origin}${location.pathname}${hash ? "#" + hash : ""}`;
}

export function showResult() {
  verdictEl.textContent = state.won ? "▼ VICTORY ▼" : "▼ RUN ENDED ▼";
  nameEl.textContent = runName();
  classEl.textContent = `the ${state.player.className} · seed ${state.seed || "random"}`;
  epitaphEl.textContent = epitaph();
  gridEl.textContent = buildGrid();
  statsEl.innerHTML = `
    <span>floor <b>${state.stats.floorsCleared}/${maxFloor}</b></span>
    <span><b>${state.stats.kills}</b> kills</span>
    <span><b>${state.stats.bossKills}</b> bosses</span>
    <span><b>${state.stats.spellsCast}</b> spells cast</span>
    <span><b>${state.stats.goldEarned}g</b> earned</span>
    <span>weapon: <b>${state.player.weapon}</b></span>
  `;
  overlay.classList.remove("hidden");
}

function hideResult() { overlay.classList.add("hidden"); }

copyBtn.addEventListener("click", async () => {
  const url = shareUrl();
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "copied!";
    setTimeout(() => { copyBtn.textContent = "copy share link"; }, 1600);
  } catch {
    copyBtn.textContent = url;
  }
});

newBtn.addEventListener("click", () => {
  // back to class screen with a fresh seed
  location.hash = "";
  location.reload();
});

replayBtn.addEventListener("click", () => {
  // keep seed in URL, drop everything else, reload
  const params = new URLSearchParams();
  if (state.seed) params.set("seed", state.seed);
  location.hash = params.toString();
  location.reload();
});
