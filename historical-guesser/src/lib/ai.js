// On-demand historical scene generation via the Gemini API (Nano Banana image
// model), called directly over REST. Returns a data: URL ready to drop into an
// <img> or a CSS background.
//
// The API key comes from VITE_GEMINI_API_KEY (.env.local, gitignored) — it is
// never hardcoded or committed.
//
// SECURITY: `vite build` inlines env vars into the client bundle, so a PUBLIC
// deploy would expose this key. For local dev / a laptop demo it stays on your
// machine. Before exposing the live site, move this call behind a server proxy
// (Cloud Function) or switch to Firebase AI Logic + App Check.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image'; // Nano Banana (Imagen shuts down 2026-06-24)
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Text model used to turn a location + year into a rich scene description.
const TEXT_MODEL = 'gemini-2.5-flash';
const TEXT_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`;

function formatYear(year) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

/**
 * Generate a wide, period-accurate panorama for a location.
 * @param {{title:string, year:number, description?:string}} location
 * @returns {Promise<string>} a `data:image/...;base64,...` URL
 */
export async function generateSceneImage({ title, year, description }) {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY — copy it into historical-guesser/.env.local and restart the dev server.'
    );
  }

  const prompt = [
    `Equirectangular 360-degree spherical panorama of ${title} as it looked around ${formatYear(year)}.`,
    description ? `Scene context: ${description}.` : '',
    'Full 360x180 VR panorama, seamless horizontal wrap, 2:1 aspect ratio, photorealistic, natural lighting,',
    'historically accurate architecture, clothing and vehicles for the period,',
    'high detail, no text, no captions, no watermarks.',
  ]
    .filter(Boolean)
    .join(' ');

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}. ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const inline = parts.find((p) => p.inlineData)?.inlineData;

  if (!inline) {
    throw new Error('The model did not return an image. Try again.');
  }
  return `data:${inline.mimeType};base64,${inline.data}`;
}

// Shared helper: send a text prompt to the Gemini text model and return the
// concatenated text response.
async function runTextPrompt(prompt) {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY — copy it into historical-guesser/.env.local and restart the dev server.'
    );
  }

  const res = await fetch(`${TEXT_ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}. ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join('')
    .trim();

  if (!text) {
    throw new Error('The model did not return any text. Try again.');
  }
  return text;
}

/**
 * Ask Gemini (text) to write a vivid, period-accurate description of a location
 * as it looked in its year — the kind of prompt you'd feed to an image model.
 * @param {{title:string, year:number, description?:string}} location
 * @returns {Promise<string>} a few sentences of descriptive text
 */
export async function generateImageDescription({ title, year, description }) {
  const prompt = [
    `Write a vivid, historically accurate visual description of ${title}`,
    `as it looked around ${formatYear(year)}.`,
    description ? `Context: ${description}.` : '',
    'Describe the architecture, people, clothing, vehicles, light and atmosphere',
    'in 3-4 sentences, as if briefing an artist. No preamble, no headings.',
  ]
    .filter(Boolean)
    .join(' ');

  return runTextPrompt(prompt);
}

/**
 * Roast the player for missing the location. Short, ironic, a little mean —
 * ideally pokes fun at wherever they actually dropped their pin versus the
 * real place.
 * @param {object} args
 * @param {{title:string, year:number, lat:number, lng:number}} args.actual
 * @param {{lat:number, lng:number}} args.guess
 * @param {number} args.distanceKm
 * @returns {Promise<string>} 1-2 punchy sentences
 */
export async function generateRoast({ actual, guess, distanceKm }) {
  const { title, year, lat, lng } = actual;
  const km = Math.round(distanceKm);

  const prompt = [
    'You are a witty, sarcastic game host in a geography guessing game.',
    `The correct answer was ${title} (${formatYear(year)}), at latitude ${lat.toFixed(2)}, longitude ${lng.toFixed(2)}.`,
    `The player dropped their pin at latitude ${guess.lat.toFixed(2)}, longitude ${guess.lng.toFixed(2)} — about ${km} km off.`,
    'In 1-2 short, punchy sentences, mock them for missing.',
    'Use your geography knowledge to joke about what is actually at or near the spot they picked (a country, ocean, desert, city, middle of nowhere) versus where it really was.',
    'Be playful, ironic and a little mean, like teasing a friend. No preamble, no quotes, no emojis-only — just the burn.',
  ]
    .filter(Boolean)
    .join(' ');

  return runTextPrompt(prompt);
}
