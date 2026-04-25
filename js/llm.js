// Groq chat completions wrapper. OpenAI-compatible, free tier.
// Key stored in localStorage under "pixelRogueGroqKey".

export const GROQ_KEY_NAME = "pixelRogueGroqKey";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export function getGroqKey() {
  return localStorage.getItem(GROQ_KEY_NAME);
}

export async function chatGroq({ prompt, json = false, maxTokens = 200 }) {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("No Groq API key");
  const body = {
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.8
  };
  if (json) body.response_format = { type: "json_object" };
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Groq ${response.status} ${body.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
