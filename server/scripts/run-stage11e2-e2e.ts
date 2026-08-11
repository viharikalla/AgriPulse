import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { AnalysisService } from '../src/services/analysis/analysisService.js';

async function runStage11E2Test() {
  console.log('=== Stage 11E-2 Real End-to-End Gemini Analysis ===\n');

  const imagePath = path.resolve(process.cwd(), '../test-assets/tomato-leaf.jpg');
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found at ${imagePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = 'image/jpeg';
  const service = new AnalysisService();

  // --- Request 1: Vijayawada ---
  console.log('Running Real Request 1 (Vijayawada)...');
  const startVij = Date.now();
  const resultVij = await service.analyzeField(
    imageBuffer,
    mimeType,
    {
      crop: 'Tomato',
      location: 'Vijayawada, Andhra Pradesh',
      latitude: 16.5062,
      longitude: 80.648,
      notes: 'Stage 11E-2 Real Gemini smoke test - Vijayawada',
    },
    'session-stage11e2-vijayawada'
  );
  const latencyVij = Date.now() - startVij;

  const firstHourVij = resultVij.weatherSnapshot.hours[0] || resultVij.weatherSnapshot.hourlyForecast[0];

  console.log('Request 1 Complete.');
  console.log(`- AI Provider: ${resultVij.sourceMetadata.providerAI}`);
  console.log(`- Weather Provider: ${resultVij.sourceMetadata.providerWeather}`);
  console.log(`- Crop: ${resultVij.crop.name}`);
  console.log(`- Condition Name: ${resultVij.assessment.primaryCondition.name}`);
  console.log(`- Condition ID: ${resultVij.assessment.primaryCondition.id}`);
  console.log(`- Confidence: ${(resultVij.assessment.confidenceScore * 100).toFixed(0)}% (${resultVij.assessment.confidenceLevel})`);
  console.log(`- Severity: ${resultVij.assessment.primaryCondition.severity}`);
  console.log(`- Visual Evidence: ${resultVij.assessment.visualObservations.join('; ')}`);
  console.log(`- Weather Temp: ${resultVij.weatherSnapshot.currentTempC}°C, Humidity: ${resultVij.weatherSnapshot.currentHumidity}%, Rain Prob: ${firstHourVij?.precipitationProbabilityPct ?? 0}%, Wind: ${resultVij.weatherSnapshot.currentWindSpeedKmh} km/h`);
  console.log(`- Decision Status: ${resultVij.decision.decisionStatus}`);
  console.log(`- Action Window: ${resultVij.decision.actionWindow.bestStartTime} to ${resultVij.decision.actionWindow.bestEndTime} (Score: ${resultVij.decision.actionWindow.suitabilityScore})`);
  console.log(`- Latency: ${latencyVij}ms\n`);

  // --- Request 2: Bengaluru ---
  console.log('Running Real Request 2 (Bengaluru - Weather Differentiation Test)...');
  const startBlr = Date.now();
  const resultBlr = await service.analyzeField(
    imageBuffer,
    mimeType,
    {
      crop: 'Tomato',
      location: 'Bengaluru, Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
      notes: 'Stage 11E-2 Real Gemini smoke test - Bengaluru',
    },
    'session-stage11e2-bengaluru'
  );
  const latencyBlr = Date.now() - startBlr;

  const firstHourBlr = resultBlr.weatherSnapshot.hours[0] || resultBlr.weatherSnapshot.hourlyForecast[0];

  console.log('Request 2 Complete.');
  console.log(`- Location: ${resultBlr.location}`);
  console.log(`- Weather Temp: ${resultBlr.weatherSnapshot.currentTempC}°C, Humidity: ${resultBlr.weatherSnapshot.currentHumidity}%, Rain Prob: ${firstHourBlr?.precipitationProbabilityPct ?? 0}%, Wind: ${resultBlr.weatherSnapshot.currentWindSpeedKmh} km/h`);
  console.log(`- Decision Status: ${resultBlr.decision.decisionStatus}`);
  console.log(`- Action Window: ${resultBlr.decision.actionWindow.bestStartTime} to ${resultBlr.decision.actionWindow.bestEndTime} (Score: ${resultBlr.decision.actionWindow.suitabilityScore})`);
  console.log(`- Latency: ${latencyBlr}ms\n`);

  // --- Save Sanitized Report ---
  const resultsDir = path.resolve(process.cwd(), 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const reportPath = path.join(resultsDir, 'stage-11e2-real-analysis.json');
  const sanitizedReport = {
    timestamp: new Date().toISOString(),
    vijayawada: {
      location: resultVij.location,
      latitude: resultVij.latitude,
      longitude: resultVij.longitude,
      providerAI: resultVij.sourceMetadata.providerAI,
      providerWeather: resultVij.sourceMetadata.providerWeather,
      crop: resultVij.crop.name,
      condition: resultVij.assessment.primaryCondition.name,
      conditionId: resultVij.assessment.primaryCondition.id,
      confidenceScore: resultVij.assessment.confidenceScore,
      confidenceLevel: resultVij.assessment.confidenceLevel,
      severity: resultVij.assessment.primaryCondition.severity,
      visualEvidence: resultVij.assessment.visualObservations,
      weatherSummary: {
        tempC: resultVij.weatherSnapshot.currentTempC,
        humidityPct: resultVij.weatherSnapshot.currentHumidity,
        windKmh: resultVij.weatherSnapshot.currentWindSpeedKmh,
        precipProbPct: firstHourVij?.precipitationProbabilityPct ?? 0,
      },
      decisionStatus: resultVij.decision.decisionStatus,
      suitabilityScore: resultVij.decision.actionWindow.suitabilityScore,
      bestStartTime: resultVij.decision.actionWindow.bestStartTime,
      bestEndTime: resultVij.decision.actionWindow.bestEndTime,
      latencyMs: latencyVij,
    },
    bengaluru: {
      location: resultBlr.location,
      latitude: resultBlr.latitude,
      longitude: resultBlr.longitude,
      providerAI: resultBlr.sourceMetadata.providerAI,
      providerWeather: resultBlr.sourceMetadata.providerWeather,
      crop: resultBlr.crop.name,
      condition: resultBlr.assessment.primaryCondition.name,
      conditionId: resultBlr.assessment.primaryCondition.id,
      confidenceScore: resultBlr.assessment.confidenceScore,
      confidenceLevel: resultBlr.assessment.confidenceLevel,
      severity: resultBlr.assessment.primaryCondition.severity,
      weatherSummary: {
        tempC: resultBlr.weatherSnapshot.currentTempC,
        humidityPct: resultBlr.weatherSnapshot.currentHumidity,
        windKmh: resultBlr.weatherSnapshot.currentWindSpeedKmh,
        precipProbPct: firstHourBlr?.precipitationProbabilityPct ?? 0,
      },
      decisionStatus: resultBlr.decision.decisionStatus,
      suitabilityScore: resultBlr.decision.actionWindow.suitabilityScore,
      bestStartTime: resultBlr.decision.actionWindow.bestStartTime,
      bestEndTime: resultBlr.decision.actionWindow.bestEndTime,
      latencyMs: latencyBlr,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(sanitizedReport, null, 2));
  console.log(`Saved sanitized test report to ${reportPath}`);
}

runStage11E2Test().catch((err) => {
  console.error('Real E2E Test Failed:', err);
  process.exit(1);
});
