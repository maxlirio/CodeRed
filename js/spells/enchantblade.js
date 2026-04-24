import { state } from "../state.js";
import { setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "enchantblade",
  name: "Enchant Blade",
  school: "arcane",
  cost: 6,
  targeting: "self",
  desc: "Imbue weapon: +5 ATK for a long stretch."
};

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "enchantblade", 16 + rank * 3, 5);
  spawnBurst(state.player.x, state.player.y, "#ffd166", 14);
  setMessage("Your weapon blazes with arcane runes.");
  return { acted: true, offensive: false };
}
