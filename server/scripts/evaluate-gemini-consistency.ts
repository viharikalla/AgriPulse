import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { GeminiVisionProvider } from '../src/providers/ai/GeminiVisionProvider.js';
import { config } from '../src/config/index.js';

async function runConsistencyEvaluation() {
  const args = process.argv.slice(2);
  const imageArg = args[0] || '../test-assets/tomato-leaf.jpg';
  const runsArg = parseInt(args[1] || '3', 10);
  const runsCount = Math.min(Math.max(1, runsArg), 5); // Limit max 5 runs to protect API quota

  console.log('=== Gemini Vision Diagnostic Consistency Evaluation ===');
  console.log(`Image: ${imageArg}`);
  console.log(`Requested Runs: ${runsCount}`);
  console.log(`Model: ${config.geminiModel || 'gemini-3.5-flash-lite'}\n`);

  const resolvedPath = path.resolve(process.cwd(), imageArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Image file not found at ${resolvedPath}`);
    process.exit(1);
  }

  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('Error: GEMINI_API_KEY is missing or empty.');
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(resolvedPath);
  const provider = new GeminiVisionProvider();
  const results: any[] = [];

  for (let i = 1; i <= runsCount; i++) {
    console.log(`[Run ${i}/${runsCount}] Executing Gemini Vision inference...`);
    const startTime = Date.now();
    try {
      const assessment = await provider.analyzeCrop(imageBuffer, 'image/jpeg', 'Tomato', 'Vijayawada');
      const latencyMs = Date.now() - startTime;

      const record = {
        run: i,
        crop: assessment.cropName,
        condition: assessment.primaryCondition.name,
        conditionId: assessment.primaryCondition.id,
        confidence: assessment.confidenceScore,
        confidenceLevel: assessment.confidenceLevel,
        severity: assessment.primaryCondition.severity,
        imageQuality: assessment.imageQuality.qualityNotes || 'good',
        latencyMs,
      };
      results.push(record);

      console.log(`  Run ${i}: Crop=${record.crop}, Condition='${record.condition}', Confidence=${(record.confidence * 100).toFixed(0)}%, Latency=${latencyMs}ms`);
    } catch (err: any) {
      console.error(`  Run ${i} FAILED: ${err.message}`);
    }
  }

  if (results.length === 0) {
    console.log('\nConsistency Evaluation: FAILED (All runs returned API errors).');
    process.exit(1);
  }

  // Calculate Agreement Rate
  const conditionCounts: Record<string, number> = {};
  results.forEach((r) => {
    conditionCounts[r.condition] = (conditionCounts[r.condition] || 0) + 1;
  });

  const dominantCondition = Object.keys(conditionCounts).reduce((a, b) =>
    conditionCounts[a] > conditionCounts[b] ? a : b
  );

  const sameCount = conditionCounts[dominantCondition];
  const diffCount = results.length - sameCount;
  const agreementRate = (sameCount / results.length) * 100;

  console.log('\n--- Consistency Evaluation Summary ---');
  console.log(`Total Successful Runs: ${results.length}`);
  console.log(`Dominant Diagnosis: '${dominantCondition}' (${sameCount}/${results.length} runs)`);
  console.log(`Same Diagnosis Count: ${sameCount}`);
  console.log(`Different Diagnosis Count: ${diffCount}`);
  console.log(`Diagnostic Agreement Rate: ${agreementRate.toFixed(1)}%\n`);

  console.log('Note: This is an engineering consistency diagnostic tool across small sample runs.');
}

runConsistencyEvaluation();
