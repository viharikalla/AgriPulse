import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { config } from '../src/config/index.js';

async function runGeminiSmokeTest() {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('Gemini connection: FAILED');
    console.log('Reason: GEMINI_API_KEY is missing');
    process.exit(1);
  }

  const model = config.geminiModel || 'gemini-3.5-flash-lite';
  const timeoutMs = config.geminiTimeoutMs || 15000;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs);
    });

    const apiPromise = ai.models.generateContent({
      model,
      contents: 'Respond with exactly: AGRIPULSE_GEMINI_OK',
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = response?.text ? response.text.trim() : '';

    if (responseText.includes('AGRIPULSE_GEMINI_OK') || responseText.length > 0) {
      console.log('Gemini connection: OK');
      console.log(`Model: ${model}`);
      console.log('Response received: YES');
    } else {
      console.log('Gemini connection: FAILED');
      console.log('Reason: empty response');
    }
  } catch (err: any) {
    console.log('Gemini connection: FAILED');
    const msg = String(err?.message || err);
    const status = err?.status || err?.statusCode;

    if (msg.includes('REQUEST_TIMEOUT')) {
      console.log('Reason: timeout');
    } else if (msg.includes('401') || msg.includes('API_KEY_INVALID') || msg.includes('UNAUTHENTICATED')) {
      console.log('Reason: authentication failure');
    } else if (status === 429 || msg.includes('429') || msg.includes('QuotaFailure') || msg.includes('RESOURCE_EXHAUSTED')) {
      console.log('Reason: rate limit / quota exceeded');
    } else {
      console.log('Reason: network connection error');
    }
  }
}

runGeminiSmokeTest();
