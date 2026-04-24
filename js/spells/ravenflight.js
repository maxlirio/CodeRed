import { state } from "../state.js";
import { SCHOOL_COLORS } from "../config.js";
import { inBounds, isWalkable, enemyAt, setMessage } from "../utils.js";
import { spawnBurst, isWallBlocked } from "../fx.js";
import { strokeTile, strokeReticle } from "./_draw.js";

export const meta = {
  id: "ravenflight",
  name: "Raven Flight",
  school: "arcane",
  cost: 7,
  targeting: "tile",
  range: 12,
  desc: "Teleport to any visible open tile."
};

export function drawAim({ mx, my, charged }) {
  const valid = inBounds(mx, my) && isWalkable(mx, my) && !isWallBlocked(mx, my) && !enemyAt(mx, my);
  strokeTile(mx, my, valid ? SCHOOL_COLORS.arcane : "#5a2a2a", { inset: 3, width: 2, alpha: 0.85 });
  strokeReticle(mx, my, charged);
}

export function effect(ctx) {
  const { tx, ty } = ctx;
  if (!inBounds(tx, ty) || !isWalkable(tx, ty) || isWallBlocked(tx, ty) || enemyAt(tx, ty)) {
    setMessage("Raven Flight can't land there.");
    return { acted: false };
  }
  spawnBurst(state.player.x, state.player.y, SCHOOL_COLORS.arcane, 12);
  state.player.x = tx;
  state.player.y = ty;
  spawnBurst(tx, ty, SCHOOL_COLORS.arcane, 14);
  setMessage("You vanish in a flurry of feathers.");
  return { acted: true, offensive: false };
}
