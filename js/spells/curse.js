import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { distance, setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "curse",
  name: "Curse",
  school: "arcane",
  cost: 7,
  targeting: "self",
  desc: "Mark all foes within 4 tiles: +50% damage taken, mana refund on hit."
};

export function effect(ctx) {
  const { rank } = ctx;
  const nearby = state.enemies.filter((e) => distance(e, state.player) <= 4);
  if (!nearby.length) { setMessage("Curse finds no one to bind."); return { acted: false }; }
  for (const e of nearby) {
    if (!e.id) e.id = `e_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    applyStatus(e, "mark", 14 + rank * 3, 1);
    spawnBurst(e.x, e.y, SCHOOL_COLORS.arcane, 8);
  }
  setMessage(`Curse binds ${nearby.length} foes.`);
  return { acted: true, offensive: false };
}
