// Seeded PRNG for map/loot/name generation.
// Combat rolls, particles, and enemy AI keep using Math.random so two players
// with the same seed get the same DUNGEON but not the same die rolls.

let _rng = Math.random;

export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function setSeed(seed) {
  let a = typeof seed === "number" ? (seed >>> 0) : hashSeed(String(seed));
  _rng = function mulberry32() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function srnd(min, max) { return Math.floor(_rng() * (max - min + 1)) + min; }
export function spick(arr) { return arr[srnd(0, arr.length - 1)]; }
export function srand() { return _rng(); }

const SEED_WORDS = [
  "astra", "void", "grim", "solar", "riven", "frost", "mire", "storm", "echo", "myth",
  "thorn", "spark", "glyph", "fang", "moss", "whisper", "ember", "shade", "nova", "rune",
  "dawn", "cinder", "tide", "fox", "gale", "dust", "king", "rook", "hollow", "veil"
];

export function randomSeedString() {
  const r = () => SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
  return `${r()}-${r()}-${Math.floor(Math.random() * 9000) + 1000}`;
}
