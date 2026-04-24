import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "phaseshift",
  name: "Phase Shift",
  school: "arcane",
  cost: 10,
  targeting: "self",
  desc: "Near-invulnerability (95% reduction) for a short while."
};

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "ward", 8 + rank * 2, 95);
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.arcane, 20);
  setMessage("You flicker out of phase.");
  return { acted: true, offensive: false };
}
