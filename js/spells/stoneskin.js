import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "stoneskin",
  name: "Stoneskin",
  school: "life",
  cost: 6,
  targeting: "self",
  desc: "Reduce incoming damage 70% for a long while."
};

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "ward", 12 + rank * 3, 70);
  spawnBurst(state.player.x, state.player.y, "#c9c9d4", 12);
  setMessage("Your skin hardens to stone.");
  return { acted: true, offensive: false };
}
