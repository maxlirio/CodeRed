import { cols, rows, ENEMY_TYPES, WEAPON_POOL } from "./config.js";
import { state } from "./state.js";
import { key } from "./utils.js";
import { srnd as rnd, spick as pick, srand } from "./rng.js";
import { makeRelic } from "./items.js";
import { makeMagicScroll } from "./augments.js";
import { SPELL_LIBRARY, rankOf, isSpellForPlayer } from "./spells/index.js";
import { makeBossName } from "./boss.js";

function carveRoom(room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) state.map[y][x] = 0;
  }
}

function carveCorridor(x1, y1, x2, y2) {
  let x = x1;
  let y = y1;
  while (x !== x2) { state.map[y][x] = 0; x += x < x2 ? 1 : -1; }
  while (y !== y2) { state.map[y][x] = 0; y += y < y2 ? 1 : -1; }
  state.map[y][x] = 0;
}

function intersects(a, b) {
  return !(a.x + a.w + 1 < b.x || b.x + b.w + 1 < a.x || a.y + a.h + 1 < b.y || b.y + b.h + 1 < a.y);
}

function randomFloorTile(room) {
  return { x: rnd(room.x + 1, room.x + room.w - 2), y: rnd(room.y + 1, room.y + room.h - 2) };
}

function placeEnemy(occupied, isBoss) {
  const room = state.rooms[rnd(1, state.rooms.length - 1)] || state.rooms[0];
  const type = pick(ENEMY_TYPES);
  let tries = 0;
  while (tries++ < 45) {
    const pos = randomFloorTile(room);
    const k = key(pos.x, pos.y);
    if (occupied.has(k)) continue;
    occupied.add(k);
    const scale = 1 + Math.floor(state.floor / 5);
    const protocol = isBoss ? "boss" : type.protocol;
    const actInterval = isBoss ? 780 : type.actInterval;
    state.enemies.push({
      x: pos.x,
      y: pos.y,
      type: isBoss ? "boss" : type.id,
      name: isBoss ? makeBossName() : type.id,
      hp: isBoss ? 32 + state.floor * 4 : type.hp + scale * 2,
      maxHp: isBoss ? 32 + state.floor * 4 : type.hp + scale * 2,
      atk: isBoss ? 8 + Math.floor(state.floor / 2) : type.atk + scale,
      baseAtk: isBoss ? 8 + Math.floor(state.floor / 2) : type.atk + scale,
      vision: isBoss ? 12 : type.vision,
      statuses: [],
      weak: isBoss ? [] : (type.weak || []),
      resist: isBoss ? [] : (type.resist || []),
      boss: isBoss,
      protocol,
      actInterval,
      actTimer: actInterval + Math.random() * 400,
      protoState: {}
    });
    break;
  }
}

export function buildFloor() {
  state.map = Array.from({ length: rows }, () => Array(cols).fill(1));
  state.rooms = [];
  state.enemies = [];
  state.stairs = null;
  state.floorEffects = [];
  state.bossAlive = false;

  const roomCount = rnd(9, 13);
  for (let i = 0; i < roomCount; i++) {
    const room = { x: rnd(1, cols - 8), y: rnd(1, rows - 7), w: rnd(4, 8), h: rnd(4, 7) };
    if (room.x + room.w >= cols - 1 || room.y + room.h >= rows - 1) continue;
    if (state.rooms.some((existing) => intersects(room, existing))) continue;

    carveRoom(room);
    if (state.rooms.length > 0) {
      const prev = state.rooms[state.rooms.length - 1];
      carveCorridor(prev.cx, prev.cy, room.x + Math.floor(room.w / 2), room.y + Math.floor(room.h / 2));
    }
    room.cx = room.x + Math.floor(room.w / 2);
    room.cy = room.y + Math.floor(room.h / 2);
    state.rooms.push(room);
  }

  if (!state.rooms.length) return buildFloor();

  const start = randomFloorTile(state.rooms[0]);
  state.player.x = start.x;
  state.player.y = start.y;

  state.stairs = randomFloorTile(state.rooms[state.rooms.length - 1]);
  state.stairsUp = { x: start.x, y: start.y };
  state.interactables = [];
  state.buildings = [];
  state.trees = [];
  state.paths = [];
  state.fountains = [];
  state.chests = [];
  const occupied = new Set([key(state.player.x, state.player.y), key(state.stairs.x, state.stairs.y)]);

  const enemyCount = 2 + Math.floor(state.floor * 1.1);
  for (let i = 0; i < enemyCount; i++) placeEnemy(occupied, false);

  if (state.floor % 5 === 0) {
    state.bossAlive = true;
    placeEnemy(occupied, true);
  }

  const chestCount = 2 + Math.floor(state.floor / 3);
  for (let i = 0; i < chestCount; i++) placeChest(occupied);
}

function placeChest(occupied) {
  const room = pick(state.rooms);
  let tries = 0;
  while (tries++ < 45) {
    const pos = randomFloorTile(room);
    const k = key(pos.x, pos.y);
    if (occupied.has(k)) continue;
    occupied.add(k);
    state.chests.push({ x: pos.x, y: pos.y, opened: false, loot: rollChestLoot() });
    break;
  }
}

function rollChestLoot() {
  const loot = { gold: 15 + Math.floor(srand() * 20) + state.floor * 2 };
  const r = srand();
  if (r < 0.30) loot.potion = true;
  else if (r < 0.52) loot.relic = makeRelic(state.floor);
  else if (r < 0.72) {
    const atCap = state.player.knownSpells.size >= 6;
    const eligible = SPELL_LIBRARY.filter(isSpellForPlayer);
    const unknown = atCap ? [] : eligible.filter((s) => !state.player.knownSpells.has(s.id));
    const rankable = eligible.filter((s) => state.player.knownSpells.has(s.id) && rankOf(s.id) < 3);
    const pool = unknown.length ? unknown : rankable;
    if (pool.length) loot.spell = pick(pool);
  }
  else if (r < 0.85) loot.scroll = makeMagicScroll();
  else if (r < 0.90) loot.weapon = pick(WEAPON_POOL);
  else if (r < 0.99) loot.spellPoints = 1 + Math.floor(state.floor / 5);
  return loot;
}

function placeBuilding(name, ox, oy, w, h, doorDx, doorDy, shopKind) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) state.map[oy + dy][ox + dx] = 1;
  }
  state.map[oy + doorDy][ox + doorDx] = 0;
  state.buildings.push({ x: ox, y: oy, w, h, shop: shopKind });
  state.interactables.push({
    x: ox + doorDx, y: oy + doorDy,
    kind: shopKind ? "shop" : "dungeon",
    shop: shopKind,
    name
  });
}

function placeFountain(x, y) {
  for (let dy = 0; dy < 2; dy++) {
    for (let dx = 0; dx < 2; dx++) state.map[y + dy][x + dx] = 1;
  }
  state.fountains.push({ x, y, w: 2, h: 2 });
}

function placeTree(x, y) {
  state.map[y][x] = 1;
  state.trees.push({ x, y });
}

function placePath(x, y) {
  if (state.map[y][x] === 0) state.paths.push({ x, y });
}

export function shopAt(x, y) {
  if (!state.buildings) return null;
  for (const b of state.buildings) {
    if (b.shop && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
      return b.shop;
    }
  }
  return null;
}

export function dungeonEntranceAt(x, y) {
  if (!state.buildings) return null;
  for (const b of state.buildings) {
    if (!b.shop && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return true;
  }
  return false;
}

// Builds a small interior scene inside the canvas. Mutates state.map and friends.
// Player spawns near the south side; vendor sits center-back; exit rug at south center.
export function buildShopInterior(kind) {
  state.map = Array.from({ length: rows }, () => Array(cols).fill(1));
  state.rooms = [];
  state.enemies = [];
  state.interactables = [];
  state.buildings = [];
  state.trees = [];
  state.paths = [];
  state.fountains = [];
  state.chests = [];
  state.floorEffects = [];

  const w = 14, h = 10;
  const x0 = Math.floor((cols - w) / 2);
  const y0 = Math.floor((rows - h) / 2);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) state.map[y][x] = 0;
  }
  state.rooms = [{ x: x0, y: y0, w, h, cx: x0 + Math.floor(w / 2), cy: y0 + Math.floor(h / 2) }];

  const cx = x0 + Math.floor(w / 2);
  const vendorPos = { x: cx, y: y0 + 2 };
  const exitPos = { x: cx, y: y0 + h - 1 };
  const counterY = y0 + 3;

  state.interactables.push({ x: vendorPos.x, y: vendorPos.y, kind: "vendor", shop: kind, name: "Vendor" });
  state.interactables.push({ x: exitPos.x, y: exitPos.y, kind: "shop_exit", name: "Exit" });

  state.shopInterior = {
    kind,
    bounds: { x0, y0, w, h },
    vendor: vendorPos,
    exit: exitPos,
    counterY,
    counterX0: x0 + 2,
    counterX1: x0 + w - 3,
    shelves: [
      { x: x0 + 1, y: y0 + 2 },
      { x: x0 + w - 2, y: y0 + 2 }
    ],
    banner: { x: cx - 1, y: y0 + 1 }
  };

  state.player.x = cx;
  state.player.y = y0 + h - 2;
}

export function buildTown() {
  state.map = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let y = 0; y < rows; y++) { state.map[y][0] = 1; state.map[y][cols - 1] = 1; }
  for (let x = 0; x < cols; x++) { state.map[0][x] = 1; state.map[rows - 1][x] = 1; }

  state.rooms = [{ x: 1, y: 1, w: cols - 2, h: rows - 2, cx: Math.floor(cols / 2), cy: Math.floor(rows / 2) }];
  state.enemies = [];
  state.floorEffects = [];
  state.bossAlive = false;
  state.stairs = null;
  state.stairsUp = null;
  state.interactables = [];
  state.buildings = [];
  state.trees = [];
  state.paths = [];
  state.fountains = [];
  state.chests = [];

  placeBuilding("Blacksmith", 2,  2, 4, 4, 1, 3, "weapon");
  placeBuilding("Alchemist", 22, 2, 4, 4, 1, 3, "alchemist");
  placeBuilding("Enchanter", 12, 2, 4, 4, 1, 3, "enchanter");
  placeBuilding("Arcanum",    2, 13, 4, 4, 1, 0, "arcanum");
  placeBuilding("Curios",    22, 13, 4, 4, 1, 0, "curio");
  placeBuilding("Dungeon Entrance", 12, 13, 4, 4, 1, 0, null);

  placeFountain(7, 7);

  placeTree(7,  2); placeTree(20, 2);
  placeTree(7, 10); placeTree(20, 10);
  placeTree(10, 16); placeTree(17, 16);

  // Paths: horizontal corridor row 10 + vertical column 14
  for (let x = 1; x < cols - 1; x++) placePath(x, 10);
  for (let y = 1; y < rows - 1; y++) placePath(14, y);
  // Door stubs
  placePath(3, 6); placePath(3, 7); placePath(3, 8); placePath(3, 9);
  placePath(23, 6); placePath(23, 7); placePath(23, 8); placePath(23, 9);
  placePath(13, 6); placePath(13, 7); placePath(13, 8); placePath(13, 9);
  placePath(3, 11); placePath(3, 12);
  placePath(23, 11); placePath(23, 12);

  state.player.x = 14;
  state.player.y = 9;
}
