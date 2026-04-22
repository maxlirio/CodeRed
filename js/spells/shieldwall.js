import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize } from "../config.js";
import { setMessage } from "../utils.js";
import { applyStatus } from "../fx.js";
import { tileCenter, strokeCircle, fillCircle } from "./_draw.js";

export const meta = {
  id: "shieldwall",
  name: "Shield Wall",
  school: "life",
  cost: 3,
  targeting: "self",
  range: 0,
  desc: "Ward 50% damage for 2 turns + light regen."
};

const casts = [];

export function renderFx() {
  for (let i = casts.length - 1; i >= 0; i--) {
    const c = casts[i];
    const t = 1 - c.life / c.max;
    const ctr = tileCenter(state.player.x, state.player.y);
    const r1 = tileSize * (0.4 + t * 0.5);
    strokeCircle(ctr.x, ctr.y, r1, "#7bdff2", { width: 3, alpha: 1 - t });
    strokeCircle(ctr.x, ctr.y, r1 * 0.8, "#ffffff", { width: 1.5, alpha: (1 - t) * 0.8 });
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + t * Math.PI;
      const rx = ctr.x + Math.cos(ang) * r1;
      const ry = ctr.y + Math.sin(ang) * r1;
      fillCircle(rx, ry, 3, "#7bdff2", { alpha: 1 - t });
    }
    c.life--;
    if (c.life <= 0) casts.splice(i, 1);
  }
}

export function effect(ctx) {
  const { rank } = ctx;
  applyStatus(state.player, "ward", 2 + Math.floor(rank / 2), 50);
  applyStatus(state.player, "regen", 2, 2);
  casts.push({ life: 22, max: 22 });
  setMessage("Shield Wall braced.");
  return { acted: true, offensive: false };
}
