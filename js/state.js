export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");
export const portraitCtx = document.getElementById("portrait").getContext("2d");

export const ui = {
  className: document.getElementById("className"),
  weapon: document.getElementById("weapon"),
  hp: document.getElementById("hp"),
  mana: document.getElementById("mana"),
  atk: document.getElementById("atk"),
  floor: document.getElementById("floor"),
  gold: document.getElementById("gold"),
  enemies: document.getElementById("enemies"),
  bossStatus: document.getElementById("bossStatus"),
  log: document.getElementById("log"),
  inventory: document.getElementById("inventory"),
  spells: document.getElementById("spells"),
  narration: document.getElementById("narration"),
  classOverlay: document.getElementById("classOverlay"),
  classChoices: document.getElementById("classChoices"),
  shopOverlay: document.getElementById("shopOverlay"),
  shopGold: document.getElementById("shopGold"),
  shopChoices: document.getElementById("shopChoices"),
  leaveShop: document.getElementById("leaveShop"),
  backpackOverlay: document.getElementById("backpackOverlay"),
  backpackChoices: document.getElementById("backpackChoices"),
  bossOverlay: document.getElementById("bossOverlay"),
  bossTitle: document.getElementById("bossTitle"),
  bossCanvas: document.getElementById("bossCanvas"),
  bossState: document.getElementById("bossState"),
  bossInput: document.getElementById("bossInput"),
  bossSubmit: document.getElementById("bossSubmit"),
  bossLog: document.getElementById("bossLog")
};

function makeRunNameParts() {
  return {
    left:  ["Astra", "Void", "Grim", "Solar", "Riven", "Frost", "Mire", "Storm", "Echo", "Myth"],
    mid:   ["thorn", "spark", "glyph", "fang", "moss", "whisper", "ember", "shade", "nova", "rune"],
    right: ["of Dawn", "of Cinders", "of Night", "of Tides", "of Roots", "of the Fox", "of Stars", "of Gales", "of Dust", "of Kings"]
  };
}

export const state = {
  floor: 1,
  map: [],
  rooms: [],
  coins: [],
  potions: [],
  relicDrops: [],
  spellDrops: [],
  weaponDrops: [],
  enemies: [],
  stairs: null,
  particles: [],
  floorEffects: [],
  screenShake: 0,
  mouseTile: null,
  aimMode: null,
  chargeArmed: false,
  aiEnabled: false,
  backpackOpen: false,
  bossBattle: null,
  player: {
    className: "",
    weapon: "",
    x: 2,
    y: 2,
    hp: 30,
    maxHp: 30,
    mana: 12,
    maxMana: 12,
    atk: 5,
    baseAtk: 5,
    spellPower: 2,
    gold: 0,
    arrows: 10,
    inventory: [],
    backpack: [],
    statuses: [],
    lastOffensive: null,
    knownSpells: new Set(["bolt", "nova", "mend"]),
    spellRanks: { bolt: 1, nova: 1, mend: 1 },
    spellSlots: { z: "bolt", x: "nova", c: "mend", v: null }
  },
  runSeedWords: makeRunNameParts(),
  bossAlive: false,
  awaitingShop: false,
  message: "Choose your class.",
  over: false,
  won: false,
  started: false
};
