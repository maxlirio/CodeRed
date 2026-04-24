import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { setMessage } from "../utils.js";
import { spawnBurst, applyStatus } from "../fx.js";

export const meta = {
  id: "regrow",
  name: "Regrow",
  school: "life",
  cost: 6,
  targeting: "self",
  desc: "Strong regen over many turns."
};

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "regen", 16 + rank * 4, 4 + rank);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 4);
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.life, 12);
  setMessage("Vines of life knit your wounds.");
  return { acted: true, offensive: false };
}
