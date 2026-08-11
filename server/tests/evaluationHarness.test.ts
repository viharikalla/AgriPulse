import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { EvaluationCaseSchema } from '../evaluation/schema.js';
import { runVisionEvaluation } from '../scripts/evaluate-vision-set.js';
import { config } from '../src/config/index.js';

describe('Stage 11H-1 Vision Evaluation Harness Tests', () => {
  const tmpDir = path.resolve(process.cwd(), 'test-temp-eval');
  const casesFile = path.resolve(tmpDir, 'cases.json');
  const imagesDir = path.resolve(tmpDir, 'images');
  const outputFile = path.resolve(tmpDir, 'output-report.json');

  beforeEach(() => {
    vi.clearAllMocks();
    (config as any).aiProvider = 'mock';

    // Create temp directory for evaluation tests
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('1. Valid case schema passes Zod validation', () => {
    const validCase = {
      id: 'eval-1',
      crop: 'Tomato',
      expectedCondition: 'early_blight',
      imagePath: 'tomato/leaf.jpg',
      datasetSource: 'PlantVillage',
      imageQuality: 'good',
    };

    const res = EvaluationCaseSchema.safeParse(validCase);
    expect(res.success).toBe(true);
  });

  it('2. Invalid case schema is rejected by Zod', () => {
    const invalidCase = {
      id: 'eval-invalid',
      crop: 'FictionalCrop',
      expectedCondition: '',
      imagePath: '',
      datasetSource: '',
    };

    const res = EvaluationCaseSchema.safeParse(invalidCase);
    expect(res.success).toBe(false);
  });

  it('3. Missing image file is recorded as ERROR with FILE_NOT_FOUND', async () => {
    const cases = [
      {
        id: 'case-missing-img',
        crop: 'Tomato',
        expectedCondition: 'early_blight',
        imagePath: 'tomato/non_existent.jpg',
        datasetSource: 'PlantVillage',
        imageQuality: 'good',
      },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      limit: 10,
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.totalCases).toBe(1);
    expect(report.caseResults[0].status).toBe('ERROR');
    expect(report.caseResults[0].errorCategory).toBe('FILE_NOT_FOUND');
  });

  it('4. Unsupported MIME type extension is recorded as ERROR with INVALID_MIME_TYPE', async () => {
    const cases = [
      {
        id: 'case-bad-mime',
        crop: 'Tomato',
        expectedCondition: 'early_blight',
        imagePath: 'tomato/unsupported.txt',
        datasetSource: 'PlantVillage',
        imageQuality: 'good',
      },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));
    const tomatoDir = path.resolve(imagesDir, 'tomato');
    if (!fs.existsSync(tomatoDir)) fs.mkdirSync(tomatoDir, { recursive: true });
    fs.writeFileSync(path.resolve(tomatoDir, 'unsupported.txt'), 'not an image');

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      limit: 10,
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.caseResults[0].status).toBe('ERROR');
    expect(report.caseResults[0].errorCategory).toBe('INVALID_MIME_TYPE');
  });

  it('5 & 6. Mock-provider safety runs structural evaluation and aggregates metrics cleanly', async () => {
    const cases = [
      {
        id: 'case-mock-1',
        crop: 'Tomato',
        expectedCondition: 'early_blight',
        imagePath: 'tomato/sample1.jpg',
        datasetSource: 'PlantVillage',
        imageQuality: 'good',
      },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));

    const tomatoDir = path.resolve(imagesDir, 'tomato');
    if (!fs.existsSync(tomatoDir)) fs.mkdirSync(tomatoDir, { recursive: true });
    fs.writeFileSync(path.resolve(tomatoDir, 'sample1.jpg'), Buffer.from('dummy jpeg data'));

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      limit: 10,
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.totalCases).toBe(1);
    expect(report.provider).toBe('mock');
    expect(report.metrics.cropAgreementCount).toBeGreaterThanOrEqual(0);
    expect(report.caseResults[0].status).toBe('SUCCESS');
  });

  it('7. Diagnostic match is true when crop and expected condition match', async () => {
    const cases = [
      {
        id: 'case-match-1',
        crop: 'Tomato',
        expectedCondition: 'early_blight',
        imagePath: 'tomato/sample1.jpg',
        datasetSource: 'PlantVillage',
        imageQuality: 'good',
      },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));

    const tomatoDir = path.resolve(imagesDir, 'tomato');
    if (!fs.existsSync(tomatoDir)) fs.mkdirSync(tomatoDir, { recursive: true });
    fs.writeFileSync(path.resolve(tomatoDir, 'sample1.jpg'), Buffer.from('dummy jpeg data'));

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      limit: 10,
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.caseResults[0].cropMatch).toBe(true);
  });

  it('11. --limit argument restricts evaluation to N cases', async () => {
    const cases = [
      { id: 'case-1', crop: 'Tomato', expectedCondition: 'early_blight', imagePath: 'tomato/1.jpg', datasetSource: 'PV' },
      { id: 'case-2', crop: 'Potato', expectedCondition: 'late_blight', imagePath: 'potato/2.jpg', datasetSource: 'PV' },
      { id: 'case-3', crop: 'Rice', expectedCondition: 'blast', imagePath: 'rice/3.jpg', datasetSource: 'FS' },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      limit: 2,
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.totalCases).toBe(2);
  });

  it('12. --case argument filters exactly one target case by ID', async () => {
    const cases = [
      { id: 'case-1', crop: 'Tomato', expectedCondition: 'early_blight', imagePath: 'tomato/1.jpg', datasetSource: 'PV' },
      { id: 'case-2', crop: 'Potato', expectedCondition: 'late_blight', imagePath: 'potato/2.jpg', datasetSource: 'PV' },
    ];
    fs.writeFileSync(casesFile, JSON.stringify(cases));

    const report = await runVisionEvaluation({
      casesFilePath: casesFile,
      imagesDirPath: imagesDir,
      caseId: 'case-2',
      allowMock: true,
      outputPath: outputFile,
    });

    expect(report.totalCases).toBe(1);
    expect(report.caseResults[0].id).toBe('case-2');
  });
});
