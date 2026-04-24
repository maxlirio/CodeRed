export const tileSize = 24;
export const cols = 28;
export const rows = 18;
export const maxFloor = 15;

export const COLORS = {
  wall: "#1f1f3b",
  floor: "#2f2f4f",
  floorShade: "#3a3a61",
  coin: "#ffd166",
  potion: "#7bdff2",
  relic: "#fca5ff",
  spell: "#6be4ff",
  weapon: "#ffc46e",
  stairs: "#ffcf5c",
  stairsUp: "#7dd3ff",
  townFloor: "#2f4a2a",
  townFloorShade: "#3a5a32",
  townPathA: "#6a5f48",
  townPathB: "#7a6f58",
  shopWeapon: "#ffc46e",
  shopAlchemist: "#7bdff2",
  shopArcanum: "#6be4ff",
  shopCurio: "#fca5ff",
  shadow: "rgba(0,0,0,0.3)",
  fog: "rgba(4,4,10,0.55)"
};

export const CLASS_OPTIONS = [
  { name: "Knight", desc: "Stalwart front-liner. Cleaves through crowds.",
    hp: 36, mana: 10, atk: 6, spellPower: 1,
    weapon: "Iron Longsword", weaponType: "sword",
    startSpells: ["shieldwall", "cleave", "warcry"] },
  { name: "Mage", desc: "Thin-skinned conjurer with elemental reach. Few weapons, many spells.",
    hp: 24, mana: 20, atk: 4, spellPower: 4,
    weapon: "Rune Staff", weaponType: "wand",
    maxWeapons: 1, maxSpellSlots: 6,
    startSpells: ["arcanemissile", "glacialprison", "firewall"] },
  { name: "Ranger", desc: "Woodland stalker. Bow at range, dagger up close.",
    hp: 29, mana: 14, atk: 5, spellPower: 2,
    weapon: "Longbow", weaponType: "bow",
    startArrows: 24,
    extraItems: [{ name: "Hunting Dagger", type: "sword" }],
    startSpells: ["huntersmark", "trapwire", "vault"] },
  { name: "Rogue", desc: "Glass-cannon striker. Blinks in, burns, fades out.",
    hp: 24, mana: 12, atk: 7, spellPower: 2,
    weapon: "Shadow Dagger", weaponType: "sword",
    startSpells: ["blink", "ember", "echo"] },
  { name: "Paladin", desc: "Holy warrior. Buffs allies, smites unholy.",
    hp: 33, mana: 14, atk: 5, spellPower: 2,
    weapon: "Blessed Mace", weaponType: "mace",
    startSpells: ["shieldwall", "warcry", "mend"] },
  { name: "Necromancer", desc: "Drains the living to feed the dark.",
    hp: 22, mana: 22, atk: 3, spellPower: 4,
    weapon: "Bone Staff", weaponType: "wand",
    startSpells: ["drain", "chain", "glacialprison"] },
  { name: "Druid", desc: "Nature's hand. Thorns, frost, and renewal.",
    hp: 28, mana: 16, atk: 4, spellPower: 3,
    weapon: "Thorn Staff", weaponType: "wand",
    startSpells: ["thorn", "mend", "frost"] },
  { name: "Warlock", desc: "Pact-sworn. Unleashes chaos at a cost.",
    hp: 23, mana: 20, atk: 3, spellPower: 4,
    weapon: "Hex Staff", weaponType: "wand",
    startSpells: ["meteor", "arcanemissile", "firewall"] }
];

export const WEAPON_POOL = [
  { name: "Recurve Bow",     atk: 2, mana:  0, type: "bow" },
  { name: "War Glaive",      atk: 4, mana: -1, type: "glaive" },
  { name: "Knight Sword",    atk: 3, mana:  0, type: "sword" },
  { name: "Spiked Mace",     atk: 4, mana: -1, type: "mace" },
  { name: "Moonlit Rapier",  atk: 2, mana:  2, type: "sword" },
  { name: "Runic Axe",       atk: 5, mana: -2, type: "axe" },
  { name: "Sapphire Wand",   atk: 1, mana:  4, type: "wand" }
];

// sprite: array of [color, dx, dy, w, h] rects drawn within a tile
export const ENEMY_TYPES = [
  { id: "slime",    hp: 7,  atk: 2, vision: 7,  weak: ["fire"],               resist: ["frost"],
    protocol: "slime",    actInterval: 950,
    sprite: [["#4bc35f", 5, 12, 14, 8], ["#8ff59a", 7, 10, 10, 3]] },
  { id: "goblin",   hp: 9,  atk: 3, vision: 8,  weak: ["life"],               resist: [],
    protocol: "goblin",   actInterval: 700,
    sprite: [["#5a8f3d", 8, 7, 8, 11], ["#b48a5a", 9, 4, 6, 4]] },
  { id: "bat",      hp: 6,  atk: 3, vision: 10, weak: ["storm"],              resist: [],
    protocol: "bat",      actInterval: 420,
    sprite: [["#7a61cc", 4, 10, 5, 4], ["#7a61cc", 9, 8, 6, 6], ["#7a61cc", 15, 10, 5, 4]] },
  { id: "skeleton", hp: 10, atk: 4, vision: 8,  weak: ["storm", "life"],      resist: ["frost"],
    protocol: "skeleton", actInterval: 750,
    sprite: [["#e7e7e7", 9, 3, 6, 5], ["#e7e7e7", 8, 9, 8, 9]] },
  { id: "imp",      hp: 8,  atk: 5, vision: 9,  weak: ["frost"],              resist: ["fire"],
    protocol: "imp",      actInterval: 600,
    sprite: [["#e4734f", 8, 7, 8, 10], ["#ff4c4c", 6, 5, 2, 4], ["#ff4c4c", 16, 5, 2, 4]] },
  { id: "wolf",     hp: 12, atk: 5, vision: 11, weak: ["fire"],               resist: [],
    protocol: "wolf",     actInterval: 460,
    sprite: [["#8d8d99", 5, 10, 14, 6], ["#8d8d99", 14, 7, 5, 4]] },
  { id: "orc",      hp: 15, atk: 6, vision: 8,  weak: ["storm"],              resist: ["fire"],
    protocol: "orc",      actInterval: 900,
    sprite: [["#4f7a32", 7, 6, 10, 12], ["#c89a6d", 9, 3, 6, 4]] },
  { id: "wraith",   hp: 11, atk: 7, vision: 12, weak: ["life", "arcane"],     resist: ["storm", "frost"],
    protocol: "wraith",   actInterval: 620,
    sprite: [["#9bc4ff", 8, 5, 8, 12], ["#e8f2ff", 10, 3, 4, 3]] }
];

export const BOSS_SPRITE = [["#8b173f", 6, 5, 12, 14], ["#f2d9d9", 9, 2, 6, 4]];

export const HERO_SPRITES = {
  Knight: [
    ["#b42d2d", 10, 0, 4, 3],
    ["#6e7380", 8, 3, 8, 3],
    ["#3a3a44", 9, 4, 6, 1],
    ["#f1c27d", 9, 6, 6, 4],
    ["#2a2a30", 10, 8, 4, 1],
    ["#b42d2d", 8, 10, 8, 8],
    ["#ffd166", 11, 12, 2, 4],
    ["#4e5260", 4, 10, 3, 8],
    ["#2a2a30", 4, 10, 3, 1],
    ["#4e5260", 7, 13, 2, 6],
    ["#4e5260", 16, 13, 2, 6],
    ["#e8e8ec", 17, 11, 2, 8],
    ["#c0c0c8", 16, 11, 4, 1]
  ],
  Mage: [
    ["#ffd54a", 17, 0, 4, 3],
    ["#5b3a8e", 18, 2, 2, 10],
    ["#5b3a8e", 12, 1, 4, 4],
    ["#4a2a72", 10, 4, 8, 2],
    ["#5b3a8e", 8, 6, 10, 2],
    ["#ffd54a", 13, 3, 2, 2],
    ["#ecd2b2", 10, 8, 6, 4],
    ["#3a56a8", 8, 12, 8, 4],
    ["#2d3a5e", 6, 16, 12, 4],
    ["#1a2a44", 10, 15, 4, 5]
  ],
  Ranger: [
    ["#6b4a2c", 3, 4, 2, 14],
    ["#8b6a3c", 3, 2, 2, 2],
    ["#8b6a3c", 3, 18, 2, 2],
    ["#3e6b3e", 9, 3, 6, 3],
    ["#2a4a2a", 8, 4, 2, 4],
    ["#d8a478", 10, 6, 4, 4],
    ["#6c8f3d", 8, 10, 8, 6],
    ["#4a6b1e", 8, 14, 8, 1],
    ["#6b4a2c", 16, 10, 2, 6],
    ["#c8a878", 16, 8, 1, 3],
    ["#6b4a2c", 9, 16, 2, 4],
    ["#6b4a2c", 13, 16, 2, 4]
  ],
  Rogue: [
    ["#1f1f28", 10, 1, 4, 2],
    ["#1f1f28", 8, 3, 8, 4],
    ["#2a2a35", 7, 5, 2, 3],
    ["#2a2a35", 15, 5, 2, 3],
    ["#6e7380", 10, 7, 4, 3],
    ["#c43232", 10, 8, 1, 1],
    ["#c43232", 13, 8, 1, 1],
    ["#1a1a22", 6, 10, 12, 10],
    ["#0a0a10", 6, 18, 12, 2],
    ["#8b8b95", 4, 8, 2, 5],
    ["#b4b4c0", 3, 8, 4, 1],
    ["#8b8b95", 18, 8, 2, 5],
    ["#b4b4c0", 17, 8, 4, 1]
  ],
  Paladin: [
    ["#ffd166", 9, 0, 6, 1],
    ["#e8d68a", 8, 2, 8, 4],
    ["#e8d68a", 5, 3, 3, 2],
    ["#e8d68a", 16, 3, 3, 2],
    ["#f1c27d", 9, 6, 6, 4],
    ["#e8e8ec", 8, 10, 8, 8],
    ["#ffd166", 11, 12, 2, 4],
    ["#d6a13a", 3, 10, 4, 8],
    ["#a07620", 4, 13, 2, 2],
    ["#d6a13a", 7, 16, 2, 4],
    ["#d6a13a", 16, 16, 2, 4],
    ["#e8e8ec", 19, 8, 2, 10],
    ["#ffd166", 17, 6, 4, 2]
  ],
  Necromancer: [
    ["#c79bff", 16, 0, 4, 3],
    ["#fca5ff", 17, 1, 2, 1],
    ["#2a1a3e", 18, 1, 2, 18],
    ["#2a1a3e", 8, 3, 8, 4],
    ["#e4d8d4", 10, 7, 4, 4],
    ["#0a0a10", 10, 8, 1, 1],
    ["#0a0a10", 13, 8, 1, 1],
    ["#1f1f2e", 7, 10, 10, 9],
    ["#0a0a14", 8, 18, 8, 2],
    ["#1f1f2e", 7, 19, 2, 1],
    ["#1f1f2e", 11, 19, 2, 1],
    ["#1f1f2e", 15, 19, 2, 1]
  ],
  Druid: [
    ["#a08060", 8, 1, 1, 4],
    ["#a08060", 7, 3, 2, 1],
    ["#a08060", 6, 1, 1, 2],
    ["#a08060", 15, 1, 1, 4],
    ["#a08060", 15, 3, 2, 1],
    ["#a08060", 17, 1, 1, 2],
    ["#4a3220", 9, 4, 6, 2],
    ["#d8a478", 10, 6, 4, 4],
    ["#4a6b2a", 8, 10, 8, 7],
    ["#84f6a6", 7, 11, 2, 2],
    ["#84f6a6", 15, 11, 2, 2],
    ["#6b4a2c", 9, 17, 2, 3],
    ["#6b4a2c", 13, 17, 2, 3],
    ["#6b4a2c", 19, 4, 2, 16],
    ["#84f6a6", 17, 2, 4, 3],
    ["#4a6b2a", 18, 5, 2, 1]
  ],
  Warlock: [
    ["#3a1a0a", 7, 0, 2, 4],
    ["#3a1a0a", 15, 0, 2, 4],
    ["#1a0a0a", 8, 3, 8, 3],
    ["#1a0a0a", 7, 5, 10, 1],
    ["#d8a878", 9, 7, 6, 4],
    ["#ff5dc1", 10, 8, 1, 1],
    ["#ff5dc1", 13, 8, 1, 1],
    ["#6e1a1a", 7, 11, 10, 7],
    ["#ff5dc1", 11, 14, 2, 2],
    ["#3a0a0a", 7, 18, 2, 2],
    ["#3a0a0a", 10, 18, 2, 2],
    ["#3a0a0a", 14, 18, 2, 2],
    ["#1a0a0a", 18, 8, 2, 3],
    ["#ff5dc1", 17, 7, 4, 3]
  ]
};

export const PORTRAIT_SPRITES = {
  Knight: [
    ["#101028", 0, 0, 16, 16],
    ["#6e7380", 6, 2, 4, 2],
    ["#f1c27d", 6, 4, 4, 4],
    ["#b42d2d", 5, 8, 6, 6],
    ["#4e5260", 4, 10, 1, 3],
    ["#4e5260", 11, 10, 1, 3]
  ],
  Mage: [
    ["#101028", 0, 0, 16, 16],
    ["#5b3a8e", 5, 1, 6, 3],
    ["#ecd2b2", 6, 4, 4, 4],
    ["#3a56a8", 5, 8, 6, 6],
    ["#2d3a5e", 4, 10, 1, 3],
    ["#2d3a5e", 11, 10, 1, 3]
  ],
  Ranger: [
    ["#101028", 0, 0, 16, 16],
    ["#3e6b3e", 6, 2, 4, 2],
    ["#d8a478", 6, 4, 4, 4],
    ["#6c8f3d", 5, 8, 6, 6],
    ["#6b4a2c", 4, 10, 1, 3],
    ["#6b4a2c", 11, 10, 1, 3]
  ],
  Rogue: [
    ["#101028", 0, 0, 16, 16],
    ["#1f1f28", 5, 2, 6, 3],
    ["#6e7380", 6, 5, 4, 3],
    ["#2a2a35", 5, 8, 6, 6],
    ["#3c2a2a", 4, 10, 1, 3],
    ["#3c2a2a", 11, 10, 1, 3]
  ],
  Paladin: [
    ["#101028", 0, 0, 16, 16],
    ["#e8d68a", 6, 2, 4, 2],
    ["#f1c27d", 6, 4, 4, 4],
    ["#e8e8ec", 5, 8, 6, 6],
    ["#d6a13a", 4, 10, 1, 3],
    ["#d6a13a", 11, 10, 1, 3]
  ],
  Necromancer: [
    ["#101028", 0, 0, 16, 16],
    ["#2a1a3e", 6, 2, 4, 2],
    ["#e4d8d4", 6, 4, 4, 4],
    ["#1f1f2e", 5, 8, 6, 6],
    ["#c79bff", 4, 10, 1, 3],
    ["#c79bff", 11, 10, 1, 3]
  ],
  Druid: [
    ["#101028", 0, 0, 16, 16],
    ["#4a3220", 6, 2, 4, 2],
    ["#d8a478", 6, 4, 4, 4],
    ["#4a6b2a", 5, 8, 6, 6],
    ["#84f6a6", 4, 10, 1, 3],
    ["#84f6a6", 11, 10, 1, 3]
  ],
  Warlock: [
    ["#101028", 0, 0, 16, 16],
    ["#1a0a0a", 5, 1, 6, 3],
    ["#d8a878", 6, 4, 4, 4],
    ["#6e1a1a", 5, 8, 6, 6],
    ["#ff5dc1", 4, 10, 1, 3],
    ["#ff5dc1", 11, 10, 1, 3]
  ]
};

export const HERO_SPRITE = HERO_SPRITES.Knight;
export const PORTRAIT_SPRITE = PORTRAIT_SPRITES.Knight;

export const COIN_SPRITE = [
  ["#a26a0a", 8, 9, 8, 6],
  ["#ffd166", 9, 8, 6, 6],
  ["#fff4c0", 10, 9, 2, 2]
];

export const POTION_SPRITE = [
  ["#b4b4c0", 10, 4, 4, 2],
  ["#8a8a96", 11, 6, 2, 2],
  ["#2d5b68", 7, 8, 10, 10],
  ["#7bdff2", 8, 9, 8, 8],
  ["#a8f3ff", 9, 10, 2, 3],
  ["#4ab4c5", 8, 17, 8, 1]
];

export const RELIC_SPRITE = [
  ["#7a2a8e", 9, 6, 6, 2],
  ["#b560c9", 8, 7, 8, 2],
  ["#fca5ff", 7, 9, 10, 6],
  ["#fff0ff", 9, 10, 2, 2],
  ["#b560c9", 8, 15, 8, 2],
  ["#5a1a6e", 9, 17, 6, 1]
];

function makeShopSprite(c) {
  return [
    // Roof (stepped pyramid, 4 layers)
    [c.roof,       40, 4, 16, 4],
    [c.roof,       32, 8, 32, 4],
    [c.roof,       24, 12, 48, 4],
    [c.roof,       16, 16, 64, 4],
    // Roof tile lines
    [c.roofDark,   34, 10, 28, 1],
    [c.roofDark,   26, 14, 44, 1],
    [c.roofDark,   18, 18, 60, 1],
    // Eave shadow
    [c.roofDark,   16, 20, 64, 3],
    // Main walls
    [c.wall,       14, 23, 68, 61],
    // Right wall shadow
    [c.wallDark,   74, 23, 8, 61],
    // Brick seams
    [c.wallDark,   14, 40, 68, 1],
    [c.wallDark,   14, 62, 68, 1],
    // Foundation
    [c.foundation, 14, 78, 68, 6],
    // Windows (3 across)
    [c.windowFrame, 20, 30, 14, 14],
    [c.windowFrame, 41, 30, 14, 14],
    [c.windowFrame, 62, 30, 14, 14],
    [c.windowGlow,  22, 32, 10, 10],
    [c.windowGlow,  43, 32, 10, 10],
    [c.windowGlow,  64, 32, 10, 10],
    // Window crossbars
    [c.windowFrame, 26, 30, 2, 14],
    [c.windowFrame, 47, 30, 2, 14],
    [c.windowFrame, 68, 30, 2, 14],
    [c.windowFrame, 20, 36, 14, 2],
    [c.windowFrame, 41, 36, 14, 2],
    [c.windowFrame, 62, 36, 14, 2],
    // Sign board above door
    [c.signBoard,   34, 50, 28, 6],
    [c.signBoard,   36, 48, 24, 2],
    [c.roofDark,    34, 55, 28, 1],
    [c.sign,        42, 52, 12, 2],
    // Door
    [c.doorFrame,   40, 58, 16, 26],
    [c.door,        42, 60, 12, 24],
    [c.doorFrame,   42, 70, 12, 1],
    [c.handle,      51, 71, 2, 2]
  ];
}

const SHOP_PALETTES = {
  weapon: {
    roof: "#8a3030", roofDark: "#5a1f1f",
    wall: "#8a8a8a", wallDark: "#5a5a5a",
    foundation: "#3a3a3a",
    door: "#4a2e20", doorFrame: "#2a1a10",
    windowFrame: "#4a2e20", windowGlow: "#ffc46e",
    signBoard: "#5a3020", sign: "#ffd166", handle: "#ffd166"
  },
  alchemist: {
    roof: "#3e9e9e", roofDark: "#1f5a5a",
    wall: "#5a7a9e", wallDark: "#2d4a6a",
    foundation: "#1f2a3a",
    door: "#4a2e20", doorFrame: "#2a1a10",
    windowFrame: "#4a2e20", windowGlow: "#a8f3ff",
    signBoard: "#2d4a6a", sign: "#7bdff2", handle: "#7bdff2"
  },
  arcanum: {
    roof: "#6b3a9e", roofDark: "#3a1a5e",
    wall: "#3a4e82", wallDark: "#1a2a52",
    foundation: "#0a1a3a",
    door: "#2a1a4e", doorFrame: "#1a0a2e",
    windowFrame: "#2a1a4e", windowGlow: "#c79bff",
    signBoard: "#2a1a4e", sign: "#6be4ff", handle: "#6be4ff"
  },
  curio: {
    roof: "#9b3a7e", roofDark: "#5a1a4a",
    wall: "#6a4a58", wallDark: "#3a2a30",
    foundation: "#2a1a20",
    door: "#3a2a30", doorFrame: "#1a0a10",
    windowFrame: "#3a2a30", windowGlow: "#fca5ff",
    signBoard: "#3a2a30", sign: "#fca5ff", handle: "#fca5ff"
  }
};

export const BUILDING_SPRITES = {
  weapon:    makeShopSprite(SHOP_PALETTES.weapon),
  alchemist: makeShopSprite(SHOP_PALETTES.alchemist),
  arcanum:   makeShopSprite(SHOP_PALETTES.arcanum),
  curio:     makeShopSprite(SHOP_PALETTES.curio)
};

export const DUNGEON_ENTRANCE_SPRITE = [
  // Battlements
  ["#2a2a3a", 10, 2, 76, 6],
  ["#15151e", 12, 2, 4, 6],
  ["#15151e", 28, 2, 4, 6],
  ["#15151e", 44, 2, 4, 6],
  ["#15151e", 60, 2, 4, 6],
  ["#15151e", 76, 2, 4, 6],
  ["#15151e", 10, 7, 76, 1],
  // Tower body
  ["#3a3a4a", 12, 8, 72, 76],
  ["#1f1f2e", 74, 8, 10, 76],
  // Brick courses
  ["#2a2a3a", 12, 24, 72, 1],
  ["#2a2a3a", 12, 40, 72, 1],
  ["#2a2a3a", 12, 56, 72, 1],
  ["#2a2a3a", 12, 72, 72, 1],
  // Arrow-slit windows
  ["#15151e", 22, 18, 4, 14],
  ["#ffcf5c", 22, 22, 4, 6],
  ["#15151e", 46, 18, 4, 14],
  ["#ffcf5c", 46, 22, 4, 6],
  ["#15151e", 70, 18, 4, 14],
  ["#ffcf5c", 70, 22, 4, 6],
  // Archway frame
  ["#5a5a6a", 32, 48, 32, 36],
  ["#5a5a6a", 36, 46, 24, 2],
  ["#5a5a6a", 40, 44, 16, 2],
  // Archway interior
  ["#0a0a14", 34, 50, 28, 34],
  ["#0a0a14", 36, 46, 24, 4],
  ["#0a0a14", 40, 44, 16, 2],
  // Torches on either side
  ["#8a5a3a", 24, 56, 2, 10],
  ["#8a5a3a", 70, 56, 2, 10],
  ["#ff9e4f", 22, 52, 6, 6],
  ["#ff9e4f", 68, 52, 6, 6],
  ["#ffe066", 23, 53, 4, 3],
  ["#ffe066", 69, 53, 4, 3],
  // Foundation
  ["#1a1a2a", 12, 78, 72, 6]
];

export const TREE_SPRITE = [
  ["#3a2a1a", 10, 14, 4, 8],
  ["#2a1a0a", 10, 20, 4, 2],
  ["#1a4a1a", 8, 4, 8, 4],
  ["#2a5a2a", 5, 6, 14, 6],
  ["#3a7a3a", 3, 11, 18, 5],
  ["#6aaa6a", 7, 7, 4, 3],
  ["#6aaa6a", 13, 5, 3, 2]
];

export const STAIRS_DOWN_SPRITE = [
  ["#2a2a2a", 2, 2, 20, 20],
  ["#555555", 2, 2, 20, 4],
  ["#444444", 4, 6, 18, 4],
  ["#333333", 6, 10, 16, 4],
  ["#222222", 8, 14, 14, 4],
  ["#111111", 10, 18, 12, 4],
  ["#ffcf5c", 2, 2, 20, 1]
];

export const STAIRS_UP_SPRITE = [
  ["#2a2a2a", 2, 2, 20, 20],
  ["#555555", 2, 18, 20, 4],
  ["#666666", 4, 14, 18, 4],
  ["#777777", 6, 10, 16, 4],
  ["#888888", 8, 6, 14, 4],
  ["#999999", 10, 2, 12, 4],
  ["#7dd3ff", 10, 2, 12, 1]
];

export const CHEST_CLOSED_SPRITE = [
  ["#4a3220", 4, 18, 16, 3],
  ["#6b4a2c", 4, 10, 16, 10],
  ["#8b5a3c", 4, 6, 16, 6],
  ["#6b4a2c", 4, 10, 16, 1],
  ["#ffd166", 4, 8, 16, 1],
  ["#ffd166", 4, 13, 16, 1],
  ["#ffd166", 4, 18, 16, 1],
  ["#ffd166", 10, 9, 4, 4],
  ["#a26a0a", 11, 11, 2, 2]
];

export const CHEST_OPEN_SPRITE = [
  ["#4a3220", 4, 18, 16, 3],
  ["#6b4a2c", 4, 14, 16, 6],
  ["#8b5a3c", 3, 6, 18, 2],
  ["#6b4a2c", 3, 8, 18, 2],
  ["#ffd166", 4, 17, 16, 1],
  ["#ffd166", 6, 14, 12, 2],
  ["#fff4c0", 8, 14, 4, 2]
];

export const MAX_KNOWN_SPELLS = 6;
export const MAX_WEAPONS = 3;

export const FOUNTAIN_SPRITE = [
  // Outer basin
  ["#4a4a5a", 3, 14, 42, 30],
  ["#8a8a9a", 3, 14, 42, 4],
  ["#2a2a3a", 3, 42, 42, 3],
  // Water
  ["#7bdff2", 7, 18, 34, 22],
  ["#a8f3ff", 9, 20, 10, 3],
  ["#a8f3ff", 27, 32, 8, 2],
  // Center pedestal
  ["#6a6a7a", 18, 8, 12, 14],
  ["#4a4a5a", 28, 8, 2, 14],
  // Pedestal cap
  ["#8a8a9a", 16, 6, 16, 4],
  ["#a8a8b8", 17, 5, 14, 1],
  // Water jet + droplets
  ["#a8f3ff", 22, 1, 4, 6],
  ["#ffffff", 23, 2, 2, 3],
  ["#a8f3ff", 19, 8, 2, 2],
  ["#a8f3ff", 27, 8, 2, 2]
];

export const BOSS_PORTRAIT_SPRITE = [
  ["#101028", 0, 0, 96, 96],
  ["#8b173f", 26, 24, 44, 52],
  ["#f2d9d9", 38, 14, 20, 14],
  ["#ff5dc1", 20, 50, 12, 8],
  ["#ff5dc1", 64, 50, 12, 8]
];

export const SCHOOL_COLORS = {
  fire: "#ff7a3a", frost: "#7dd3ff", storm: "#c79bff",
  life: "#84f6a6", arcane: "#ff9cf0"
};

export const STATUS_DEFS = {
  burn:  { tag: "B", color: "#ff7a3a" },
  chill: { tag: "C", color: "#7dd3ff" },
  shock: { tag: "S", color: "#c79bff" },
  stun:  { tag: "Z", color: "#ffffff" },
  regen: { tag: "+", color: "#84f6a6" },
  ward:  { tag: "W", color: "#7bdff2" },
  mark:  { tag: "M", color: "#fca5ff" },
  haste: { tag: "H", color: "#ffd166" },
  enchantblade: { tag: "E", color: "#ffd54a" }
};
