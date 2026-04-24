import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "haste",
  name: "Haste",
  school: "arcane",
  cost: 5,
  targeting: "self",
  desc: "Move twice as fast for a long while."
};

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "haste", 14 + rank * 3, 1);
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.arcane, 14);
  setMessage("The world slows around you.");
  return { acted: true, offensive: false };
}
