// On-demand historical scene generation via Firebase AI Logic (Gemini image
// model / "Nano Banana"). Returns a data: URL ready to drop into an <img> or a
// CSS background.
//
// Requires the project to be on the Blaze plan and AI Logic provisioned
// (`firebase init ailogic`). Errors propagate to the caller so the UI can show
// a friendly message and keep working.

import { imageModel } from '../firebase.js';

function formatYear(year) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

/**
 * Generate a wide, period-accurate panorama for a location.
 * @param {{title:string, year:number, description?:string}} location
 * @returns {Promise<string>} a `data:image/...;base64,...` URL
 */
export async function generateSceneImage({ title, year, description }) {
  const prompt = [
    `Ultra-wide cinematic panoramic photograph of ${title} as it looked around ${formatYear(year)}.`,
    description ? `Scene context: ${description}.` : '',
    'Photorealistic, natural lighting, historically accurate architecture, clothing and vehicles for the period,',
    'wide landscape framing, high detail, no text, no captions, no watermarks.',
  ]
    .filter(Boolean)
    .join(' ');

  const result = await imageModel.generateContent(prompt);
  const parts = result.response.inlineDataParts();
  const inline = parts && parts[0] && parts[0].inlineData;

  if (!inline) {
    throw new Error('The model did not return an image. Try again.');
  }
  return `data:${inline.mimeType};base64,${inline.data}`;
}
