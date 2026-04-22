export const tileSize = 24;
export const cols = 28;
export const rows = 18;
export const maxFloor = 100;

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
  shadow: "rgba(0,0,0,0.3)",
  fog: "rgba(4,4,10,0.55)"
};

export const CLASS_OPTIONS = [
  { name: "Knight", hp: 36, mana: 10, atk: 6, spellPower: 1, weapon: "Iron Longsword" },
  { name: "Mage",   hp: 24, mana: 20, atk: 4, spellPower: 4, weapon: "Rune Staff" },
  { name: "Ranger", hp: 29, mana: 14, atk: 5, spellPower: 2, weapon: "Hunter Spear" }
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

export const ENEMY_TYPES = [
  { id: "slime",    hp: 7,  atk: 2, vision: 7,  weak: ["fire"],               resist: ["frost"] },
  { id: "goblin",   hp: 9,  atk: 3, vision: 8,  weak: ["life"],               resist: [] },
  { id: "bat",      hp: 6,  atk: 3, vision: 10, weak: ["storm"],              resist: [] },
  { id: "skeleton", hp: 10, atk: 4, vision: 8,  weak: ["storm", "life"],      resist: ["frost"] },
  { id: "imp",      hp: 8,  atk: 5, vision: 9,  weak: ["frost"],              resist: ["fire"] },
  { id: "wolf",     hp: 12, atk: 5, vision: 11, weak: ["fire"],               resist: [] },
  { id: "orc",      hp: 15, atk: 6, vision: 8,  weak: ["storm"],              resist: ["fire"] },
  { id: "wraith",   hp: 11, atk: 7, vision: 12, weak: ["life", "arcane"],     resist: ["storm", "frost"] }
];

export const SCHOOLS = { FIRE: "fire", FROST: "frost", STORM: "storm", LIFE: "life", ARCANE: "arcane" };

export const SCHOOL_COLORS = {
  fire: "#ff7a3a", frost: "#7dd3ff", storm: "#c79bff",
  life: "#84f6a6", arcane: "#ff9cf0"
};

export const STATUS_DEFS = {
  burn:  { tag: "B", color: "#ff7a3a" },
  chill: { tag: "C", color: "#7dd3ff" },
  shock: { tag: "S", color: "#c79bff" },
  stun:  { tag: "Z", color: "#ffffff" },
  regen: { tag: "+", color: "#84f6a6" }
};

// targeting kinds: self | adjacent | line | tile | aim | teleport | wall
export const SPELL_LIBRARY = [
  { id: "bolt",   name: "Arc Bolt",      school: SCHOOLS.STORM,  cost: 4,  targeting: "line",    range: 9, desc: "Line strike. Shocks. R2 pierces. R3 stuns on crit." },
  { id: "chain",  name: "Chain Spark",   school: SCHOOLS.STORM,  cost: 8,  targeting: "self",    range: 0, desc: "Hits 3/4/5 nearest foes, falloff. Shocks all." },
  { id: "nova",   name: "Flame Nova",    school: SCHOOLS.FIRE,   cost: 7,  targeting: "tile",    range: 5, desc: "AoE blast at a tile. Leaves burn floor." },
  { id: "ember",  name: "Ember Mine",    school: SCHOOLS.FIRE,   cost: 5,  targeting: "tile",    range: 4, desc: "Place a mine. First foe trips it for a 3x3 burn." },
  { id: "meteor", name: "Meteor",        school: SCHOOLS.FIRE,   cost: 11, targeting: "tile",    range: 8, desc: "Massive crater, heavy burn tiles." },
  { id: "frost",  name: "Frost Lance",   school: SCHOOLS.FROST,  cost: 6,  targeting: "line",    range: 8, desc: "Pierces all in a line. Chills. Shatters chilled." },
  { id: "pull",   name: "Tide Pull",     school: SCHOOLS.FROST,  cost: 5,  targeting: "aim",     range: 8, desc: "Yank a foe 3 tiles toward you. Chills." },
  { id: "mend",   name: "Mend",          school: SCHOOLS.LIFE,   cost: 5,  targeting: "self",    range: 0, desc: "Instant heal + short regen." },
  { id: "drain",  name: "Vampire Touch", school: SCHOOLS.LIFE,   cost: 4,  targeting: "adjacent",range: 1, desc: "Strike adjacent foes, heal for 60% dealt." },
  { id: "thorn",  name: "Thornwall",     school: SCHOOLS.LIFE,   cost: 6,  targeting: "wall",    range: 4, desc: "Three root walls block foes 5+ turns." },
  { id: "blink",  name: "Blink",         school: SCHOOLS.ARCANE, cost: 4,  targeting: "teleport",range: 6, desc: "Teleport to a visible tile." },
  { id: "echo",   name: "Echo",          school: SCHOOLS.ARCANE, cost: 3,  targeting: "self",    range: 0, desc: "Recast your last offensive spell at half cost." }
];

export const SPELL_BY_ID = Object.fromEntries(SPELL_LIBRARY.map((s) => [s.id, s]));
