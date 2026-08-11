import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { config } from '../src/config/index.js';

async function runGeminiTextTest() {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('Gemini text test: FAILED');
    console.log('Reason: GEMINI_API_KEY is missing or empty.');
    process.exit(1);
  }

  const modelName = config.geminiModel || 'gemini-3.5-flash-lite';
  const timeoutMs = config.geminiTimeoutMs || 15000;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs);
    });

    const textPromise = ai.models.generateContent({
      model: modelName,
      contents: 'Respond with exactly AGRIPULSE_TEXT_OK',
    });

    const response = await Promise.race([textPromise, timeoutPromise]);
    const responseText = response?.text ? response.text.trim() : '';

    if (responseText.includes('AGRIPULSE_TEXT_OK') || responseText.length > 0) {
      console.log('Gemini text test: OK');
      console.log(`Model: ${modelName}`);
      console.log(`Response: ${responseText}`);
    } else {
      console.log('Gemini text test: FAILED');
      console.log('Reason: Empty text response.');
    }
  } catch (err: any) {
    const errorStr = String(err?.message || err);
    const sanitizedError = errorStr.replace(/key=[^&\s]+/gi, 'key=REDACTED');
    const statusCode = err?.status || err?.statusCode || (sanitizedError.includes('404') ? 404 : 'N/A');

    let category = 'UNKNOWN';
    if (statusCode === 400 || sanitizedError.includes('400')) category = 'INVALID_ARGUMENT';
    else if (statusCode === 403 || sanitizedError.includes('403')) category = 'PERMISSION_DENIED';
    else if (statusCode === 404 || sanitizedError.includes('404')) category = 'MODEL_NOT_FOUND_OR_UNSUPPORTED';
    else if (statusCode === 429 || sanitizedError.includes('429')) category = 'RESOURCE_EXHAUSTED';
    else if (statusCode === 500 || sanitizedError.includes('500')) category = 'INTERNAL';
    else if (statusCode === 503 || sanitizedError.includes('503')) category = 'UNAVAILABLE';
    else if (statusCode === 504 || sanitizedError.includes('504')) category = 'DEADLINE_EXCEEDED';

    console.log('Gemini text test: FAILED');
    console.log(`Model: ${modelName}`);
    console.log(`HTTP: ${statusCode}`);
    console.log(`Category: ${category}`);
    console.log(`Sanitized Message: ${sanitizedError}`);
  }
}

runGeminiTextTest();
