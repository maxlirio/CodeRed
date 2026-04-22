import { CLASS_OPTIONS } from "./config.js";
import { setMessage } from "./utils.js";
import { renderClassChoices } from "./ui.js";
import { loop } from "./render.js";
import { attachInput, initTouch } from "./input.js";
import { setSeed } from "./rng.js";
import { chooseClass } from "./turn.js";

function parseHash() {
  const h = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  return new URLSearchParams(h);
}

const params = parseHash();
const urlSeed = params.get("seed") || "";
const urlName = params.get("name") || "";
const urlClass = params.get("class") || "";

renderClassChoices({ seed: urlSeed, name: urlName });
attachInput();
initTouch();
loop();

// Auto-start if URL has seed + name + valid class — a full replay link
const cls = urlClass && CLASS_OPTIONS.find((c) => c.name.toLowerCase() === urlClass.toLowerCase());
if (urlSeed && urlName && cls) {
  setSeed(urlSeed);
  chooseClass(cls, { heroName: urlName, seed: urlSeed });
} else {
  setMessage("Choose your class to start the run.");
}
