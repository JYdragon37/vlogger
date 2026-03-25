// lib/openai.ts
//
// NOTE: EXPO_PUBLIC_OPENAI_API_KEY is embedded in the JS bundle at build time.
// This is acceptable for MVP/development. For production, replace with a
// backend proxy (e.g. Firebase Cloud Functions) to protect the key.

const API_URL = "https://api.openai.com/v1/chat/completions";

export interface ScriptResult {
  topic: string;      // e.g. "강남 브런치 Gangnam Brunch Cafe"
  script: string;     // Full script with **bold** expressions
  expressions: string[];  // Exactly 5 key expressions
}

export async function generateVlogScript(profile: {
  name: string;
  job: string;
  location: string;
  hobbies: string[];
  englishLevel: string;
}): Promise<ScriptResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");

  const hobbiesText = profile.hobbies.length > 0 ? profile.hobbies.join(", ") : "daily life";

  const prompt = `You are an English speaking coach for Korean learners.

Generate a 150-200 word English vlog script for ${profile.name}, a ${profile.job || "professional"} living in ${profile.location || "Korea"} who enjoys ${hobbiesText}.

English level: ${profile.englishLevel} (adjust vocabulary complexity accordingly — Beginner: simple words; Intermediate: natural everyday English; Advanced: richer vocabulary).

Requirements:
- Conversational, enthusiastic vlog-style narration (like they're talking to their YouTube audience)
- Topic based on their daily life or interests — make it feel specific and personal
- Naturally embed exactly 5 key English expressions/phrases, marking each with **double asterisks**
- Keep it warm, relatable, and fun

Return valid JSON only:
{
  "topic": "topic title in Korean + English (e.g. '강남 브런치 카페 / Gangnam Brunch Cafe')",
  "script": "full script with exactly 5 expressions wrapped in **double asterisks**",
  "expressions": ["expression 1", "expression 2", "expression 3", "expression 4", "expression 5"]
}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as ScriptResult;
}
