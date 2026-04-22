import { setMessage } from "./utils.js";
import { renderClassChoices } from "./ui.js";
import { loop } from "./render.js";
import { attachInput } from "./input.js";

renderClassChoices();
setMessage("Choose your class to start the run.");
attachInput();
loop();
