import { spick } from "./rng.js";

const BOSS_FIRST = ["Gore", "Night", "Bone", "Murk", "Rot", "Hex", "Dread", "Iron", "Blight", "Ash"];
const BOSS_SECOND = ["maw", "king", "warden", "tyrant", "seer", "fang", "golem", "devourer", "brute", "reaper"];

export function makeBossName() { return `${spick(BOSS_FIRST)}${spick(BOSS_SECOND)}`; }
