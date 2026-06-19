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
    `Ultra-wide cinematic panoramic photograph of ${title} as it looked around ${formatYear(year)}.`,
    description ? `Scene context: ${description}.` : '',
    'Photorealistic, natural lighting, historically accurate architecture, clothing and vehicles for the period,',
    'wide landscape framing, high detail, no text, no captions, no watermarks.',
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
