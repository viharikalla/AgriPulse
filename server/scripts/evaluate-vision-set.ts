import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { config } from '../src/config/index.js';
import { EvaluationCaseSchema, EvaluationCase } from '../evaluation/schema.js';
import { getAIProvider } from '../src/providers/ai/aiProviderFactory.js';
import { AIReliabilityService } from '../src/services/ai/aiReliabilityService.js';
import { AgronomyService } from '../src/services/agronomy/agronomyService.js';
import { SupportedCrop } from '../src/types/index.js';

export interface CaseResult {
  id: string;
  crop: string;
  expectedCondition: string;
  predictedCondition: string;
  confidence: number;
  severity: string;
  imageQuality: string;
  reliabilityStatus: string;
  reliabilityReason: string;
  cropMatch: boolean;
  conditionSupported: boolean;
  diagnosticMatch: boolean;
  status: 'SUCCESS' | 'ERROR' | 'SKIPPED';
  errorCategory?: string;
  errorMessageSafe?: string;
}

export interface EvaluationReport {
  timestamp: string;
  model: string;
  provider: string;
  totalCases: number;
  metrics: {
    totalCases: number;
    cropAgreementCount: number;
    cropAgreementPercentage: number;
    diagnosticAgreementCount: number;
    diagnosticAgreementPercentage: number;
    reliableCount: number;
    needsReviewCount: number;
    unsupportedCount: number;
    groundedConditionCount: number;
  };
  caseResults: CaseResult[];
}

export async function runVisionEvaluation(options?: {
  casesFilePath?: string;
  imagesDirPath?: string;
  limit?: number;
  caseId?: string;
  delayMs?: number;
  allowMock?: boolean;
  outputPath?: string;
}) {
  const casesFile = options?.casesFilePath || path.resolve(process.cwd(), 'evaluation/cases.json');
  const imagesDir = options?.imagesDirPath || path.resolve(process.cwd(), 'evaluation/images');
  const limitArg = options?.limit ?? 5;
  const caseIdArg = options?.caseId;
  const delayMs = options?.delayMs ?? 1000;
  const allowMock = options?.allowMock ?? false;
  const outputPath = options?.outputPath || path.resolve(process.cwd(), 'test-results/evaluation-report.json');

  console.log('=== AgriPulse Multi-Crop Vision Evaluation Harness ===');
  console.log(`Cases File: ${casesFile}`);
  console.log(`Configured AI Provider: ${config.aiProvider}`);
  console.log(`Configured Model: ${config.geminiModel}`);

  // Quota Protection Check
  if (config.aiProvider === 'mock' && !allowMock) {
    console.log('\n[QUOTA PROTECTION ACTIVE]');
    console.log('AI_PROVIDER is currently set to "mock".');
    console.log('To run real Gemini vision evaluation, set AI_PROVIDER=gemini in server/.env.');
    console.log('To validate evaluation harness structure using MockAIProvider, run with --allow-mock flag.\n');
  }

  if (!fs.existsSync(casesFile)) {
    console.error(`Error: Cases file not found at ${casesFile}`);
    process.exit(1);
  }

  const rawCasesJson = JSON.parse(fs.readFileSync(casesFile, 'utf-8'));
  let cases: EvaluationCase[] = [];

  for (const item of rawCasesJson) {
    const parseResult = EvaluationCaseSchema.safeParse(item);
    if (parseResult.success) {
      cases.push(parseResult.data);
    } else {
      console.warn(`Warning: Skipping invalid case entry (${item.id || 'unknown'}): ${parseResult.error.message}`);
    }
  }

  if (caseIdArg) {
    cases = cases.filter((c) => c.id === caseIdArg);
    console.log(`Filter: Single Case Selected (${caseIdArg}). Total: ${cases.length}`);
  } else if (limitArg > 0) {
    cases = cases.slice(0, limitArg);
    console.log(`Filter: Limit Applied (${limitArg}). Total: ${cases.length}`);
  }

  const provider = getAIProvider(config.aiProvider);
  const caseResults: CaseResult[] = [];

  let cropAgreementCount = 0;
  let diagnosticAgreementCount = 0;
  let reliableCount = 0;
  let needsReviewCount = 0;
  let unsupportedCount = 0;
  let groundedConditionCount = 0;

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    console.log(`\n[Case ${i + 1}/${cases.length}] Evaluating ${c.id} (${c.crop} - ${c.expectedCondition})...`);

    const imageFullPath = path.resolve(imagesDir, c.imagePath);

    if (!fs.existsSync(imageFullPath)) {
      console.warn(`  Result: SKIPPED / ERROR (Image missing at ${imageFullPath})`);
      caseResults.push({
        id: c.id,
        crop: c.crop,
        expectedCondition: c.expectedCondition,
        predictedCondition: 'N/A',
        confidence: 0,
        severity: 'Low',
        imageQuality: c.imageQuality,
        reliabilityStatus: 'NEEDS_REVIEW',
        reliabilityReason: 'MISSING_IMAGE_FILE',
        cropMatch: false,
        conditionSupported: false,
        diagnosticMatch: false,
        status: 'ERROR',
        errorCategory: 'FILE_NOT_FOUND',
        errorMessageSafe: `Evaluation image file not found at ${c.imagePath}`,
      });
      needsReviewCount++;
      continue;
    }

    // Check MIME Type
    const ext = path.extname(imageFullPath).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!validExts.includes(ext)) {
      console.warn(`  Result: SKIPPED / ERROR (Unsupported MIME type extension '${ext}')`);
      caseResults.push({
        id: c.id,
        crop: c.crop,
        expectedCondition: c.expectedCondition,
        predictedCondition: 'N/A',
        confidence: 0,
        severity: 'Low',
        imageQuality: c.imageQuality,
        reliabilityStatus: 'NEEDS_REVIEW',
        reliabilityReason: 'UNSUPPORTED_MIME_TYPE',
        cropMatch: false,
        conditionSupported: false,
        diagnosticMatch: false,
        status: 'ERROR',
        errorCategory: 'INVALID_MIME_TYPE',
        errorMessageSafe: `Image file extension '${ext}' is not supported.`,
      });
      needsReviewCount++;
      continue;
    }

    try {
      const imageBuffer = fs.readFileSync(imageFullPath);
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      const assessment = await provider.analyzeCrop(imageBuffer, mimeType, c.crop as SupportedCrop, 'EvaluationField');
      const reliability = AIReliabilityService.evaluate(assessment, c.crop as SupportedCrop);

      const detectedCrop = assessment.cropName || 'unknown';
      const detectedConditionName = assessment.primaryCondition.name;
      const rawConditionId = assessment.primaryCondition.id.split('_').slice(1).join('_') || 'unknown';

      const cropMatch = detectedCrop.toLowerCase() === c.crop.toLowerCase();
      const conditionSupported = AgronomyService.isConditionSupported(c.crop as SupportedCrop, rawConditionId);
      const diagnosticMatch = cropMatch && rawConditionId.toLowerCase() === c.expectedCondition.toLowerCase() && rawConditionId !== 'unknown';

      if (cropMatch) cropAgreementCount++;
      if (diagnosticMatch) diagnosticAgreementCount++;
      if (conditionSupported) groundedConditionCount++;

      if (reliability.status === 'RELIABLE') reliableCount++;
      else if (reliability.status === 'UNSUPPORTED') unsupportedCount++;
      else needsReviewCount++;

      caseResults.push({
        id: c.id,
        crop: c.crop,
        expectedCondition: c.expectedCondition,
        predictedCondition: rawConditionId,
        confidence: assessment.confidenceScore,
        severity: assessment.primaryCondition.severity,
        imageQuality: assessment.imageQuality.qualityNotes || c.imageQuality,
        reliabilityStatus: reliability.status,
        reliabilityReason: reliability.reasonCode,
        cropMatch,
        conditionSupported,
        diagnosticMatch,
        status: 'SUCCESS',
      });

      console.log(`  Result: SUCCESS | Detected='${rawConditionId}' | DiagnosticMatch=${diagnosticMatch} | Reliability=${reliability.status}`);
    } catch (err: any) {
      console.error(`  Result: ERROR (${err.message})`);
      caseResults.push({
        id: c.id,
        crop: c.crop,
        expectedCondition: c.expectedCondition,
        predictedCondition: 'ERROR',
        confidence: 0,
        severity: 'Low',
        imageQuality: c.imageQuality,
        reliabilityStatus: 'NEEDS_REVIEW',
        reliabilityReason: 'PROVIDER_ERROR',
        cropMatch: false,
        conditionSupported: false,
        diagnosticMatch: false,
        status: 'ERROR',
        errorCategory: err.code || 'AI_PROVIDER_ERROR',
        errorMessageSafe: err.message || 'Error occurred during AI provider analysis.',
      });
      needsReviewCount++;
    }

    // Delay between cases to respect API quota limits
    if (i < cases.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const totalCases = caseResults.length;
  const cropAgreementPercentage = totalCases > 0 ? (cropAgreementCount / totalCases) * 100 : 0;
  const diagnosticAgreementPercentage = totalCases > 0 ? (diagnosticAgreementCount / totalCases) * 100 : 0;

  const report: EvaluationReport = {
    timestamp: new Date().toISOString(),
    model: config.geminiModel,
    provider: config.aiProvider,
    totalCases,
    metrics: {
      totalCases,
      cropAgreementCount,
      cropAgreementPercentage: parseFloat(cropAgreementPercentage.toFixed(1)),
      diagnosticAgreementCount,
      diagnosticAgreementPercentage: parseFloat(diagnosticAgreementPercentage.toFixed(1)),
      reliableCount,
      needsReviewCount,
      unsupportedCount,
      groundedConditionCount,
    },
    caseResults,
  };

  // Ensure output directory exists and write report
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log('\n--- Evaluation Harness Summary ---');
  console.log(`Total Cases Evaluated: ${totalCases}`);
  console.log(`Crop Agreement Count: ${cropAgreementCount} (${cropAgreementPercentage.toFixed(1)}%)`);
  console.log(`Diagnostic Agreement Count: ${diagnosticAgreementCount} (${diagnosticAgreementPercentage.toFixed(1)}%)`);
  console.log(`Reliability Outcomes: RELIABLE=${reliableCount}, NEEDS_REVIEW=${needsReviewCount}, UNSUPPORTED=${unsupportedCount}`);
  console.log(`Report Saved To: ${outputPath}\n`);

  return report;
}

// CLI Execution Handler
if (process.argv[1] && process.argv[1].endsWith('evaluate-vision-set.ts')) {
  const args = process.argv.slice(2);
  let limit: number | undefined;
  let caseId: string | undefined;
  let delayMs: number | undefined;
  let allowMock = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--case' && args[i + 1]) {
      caseId = args[i + 1];
      i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
      delayMs = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--allow-mock') {
      allowMock = true;
    }
  }

  runVisionEvaluation({ limit, caseId, delayMs, allowMock });
}
