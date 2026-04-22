import { state, ui } from "./state.js";

export async function narrateCombat(eventText) {
  if (!state.aiEnabled) {
    ui.narration.textContent = `Narration: ${eventText}`;
    return;
  }
  const apiKey = localStorage.getItem("pixelRogueOpenAIKey");
  if (!apiKey) {
    ui.narration.textContent = "Narration: AI mode enabled, but no API key saved. Press N.";
    return;
  }
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Make this combat event a short, exciting one-liner (max 14 words): ${eventText}`,
        max_output_tokens: 40
      })
    });
    if (!response.ok) throw new Error("Narration API failed");
    const data = await response.json();
    ui.narration.textContent = `Narration: ${(data.output_text || eventText).trim()}`;
  } catch {
    ui.narration.textContent = `Narration: ${eventText}`;
  }
}
