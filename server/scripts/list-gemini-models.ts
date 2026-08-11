import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { config } from '../src/config/index.js';

async function listGeminiModels() {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('Model Discovery: FAILED');
    console.log('Reason: GEMINI_API_KEY is missing or empty.');
    process.exit(1);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.list();

    console.log('Gemini Model Discovery');
    console.log('----------------------\n');

    let gemini25FlashFound = false;
    let gemini25FlashGenerateContent = false;
    const modelNames: string[] = [];

    // Handle AsyncIterable or PagedResponse
    if (typeof (response as any)[Symbol.asyncIterator] === 'function') {
      for await (const m of (response as any)) {
        const name = m.name || m.id || String(m);
        const methods = m.supportedGenerationMethods || m.supportedMethods || [];
        modelNames.push(name);

        if (name === 'gemini-3.5-flash-lite' || name === 'models/gemini-3.5-flash-lite') {
          gemini25FlashFound = true;
          if (Array.isArray(methods) && (methods.includes('generateContent') || methods.length === 0)) {
            gemini25FlashGenerateContent = true;
          }
        }
      }
    } else {
      const rawList = Array.isArray(response)
        ? response
        : (response as any)?.models || (response as any)?.page || [];

      for (const m of rawList) {
        const name = m.name || m.id || String(m);
        const methods = m.supportedGenerationMethods || m.supportedMethods || [];
        modelNames.push(name);

        if (name === 'gemini-3.5-flash-lite' || name === 'models/gemini-3.5-flash-lite') {
          gemini25FlashFound = true;
          if (Array.isArray(methods) && (methods.includes('generateContent') || methods.length === 0)) {
            gemini25FlashGenerateContent = true;
          }
        }
      }
    }

    if (modelNames.length === 0) {
      console.log('Available Models (0): None returned by API key.\n');
    } else {
      console.log(`Available Models (${modelNames.length}):`);
      modelNames.slice(0, 15).forEach((name) => console.log(`- ${name}`));
      if (modelNames.length > 15) console.log(`... and ${modelNames.length - 15} more`);
      console.log('');
    }

    console.log(`Gemini 3.5 Flash Lite found: ${gemini25FlashFound ? 'YES' : 'NO'}`);
    if (gemini25FlashFound) {
      console.log(`generateContent supported: ${gemini25FlashGenerateContent ? 'YES' : 'NO'}`);
    }
  } catch (err: any) {
    console.log('Model Discovery: FAILED');
    const msg = String(err?.message || err).replace(/key=[^&\s]+/gi, 'key=REDACTED');
    const status = err?.status || err?.statusCode || 'N/A';
    console.log(`HTTP: ${status}`);
    console.log(`Sanitized Error: ${msg}`);
  }
}

listGeminiModels();
