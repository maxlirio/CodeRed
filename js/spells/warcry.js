import { state } from "../state.js";
import { SCHOOL_COLORS, tileSize } from "../config.js";
import { distance, setMessage } from "../utils.js";
import { applyStatus, doScreenShake } from "../fx.js";
import { tileCenter, strokeCircle } from "./_draw.js";

export const meta = {
  id: "warcry",
  name: "Warcry",
  school: "life",
  cost: 3,
  targeting: "self",
  range: 1,
  desc: "Stun adjacent foes for 1 turn + heal 4 HP."
};

const shouts = [];

export function renderFx() {
  for (let i = shouts.length - 1; i >= 0; i--) {
    const s = shouts[i];
    const t = 1 - s.life / s.max;
    const ctr = tileCenter(state.player.x, state.player.y);
    const r = tileSize * 0.3 + t * tileSize * 1.2;
    strokeCircle(ctr.x, ctr.y, r, "#ffd166", { width: 3, alpha: 1 - t });
    strokeCircle(ctr.x, ctr.y, r * 0.7, SCHOOL_COLORS.life, { width: 2, alpha: (1 - t) * 0.9 });
    s.life--;
    if (s.life <= 0) shouts.splice(i, 1);
  }
}

export function effect(ctx) {
  const { rank } = ctx;
  const stunned = state.enemies.filter((e) => distance(e, state.player) <= 1);
  for (const e of stunned) applyStatus(e, "stun", 5 + rank * 2, 1);
  const heal = 4 + rank;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
  shouts.push({ life: 18, max: 18 });
  shouts.push({ life: 22, max: 22 });
  doScreenShake(4);
  setMessage(`Warcry stuns ${stunned.length}, heals ${heal}.`);
  return { acted: true, offensive: false };
}
