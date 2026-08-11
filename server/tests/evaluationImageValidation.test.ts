import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { EvaluationCaseSchema } from '../evaluation/schema.js';
import { AgronomyService } from '../src/services/agronomy/agronomyService.js';
import { SupportedCrop } from '../src/types/index.js';

describe('Stage 11H-2 Evaluation Image & Manifest Integrity Tests', () => {
  const casesFile = path.resolve(process.cwd(), 'evaluation/cases.json');
  const manifestFile = path.resolve(process.cwd(), 'evaluation/source-manifest.json');
  const imagesDir = path.resolve(process.cwd(), 'evaluation/images');

  const casesJson = JSON.parse(fs.readFileSync(casesFile, 'utf-8'));
  const manifestJson = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));

  it('1. Every registered image exists on the local filesystem', () => {
    for (const c of casesJson) {
      const fullPath = path.resolve(imagesDir, c.imagePath);
      expect(fs.existsSync(fullPath), `Image missing for case '${c.id}' at ${fullPath}`).toBe(true);
    }
  });

  it('2. Every registered crop is supported in the AgriPulse 10-crop taxonomy', () => {
    const supportedCrops: SupportedCrop[] = [
      'Rice',
      'Wheat',
      'Maize',
      'Tomato',
      'Potato',
      'Chilli',
      'Soybean',
      'Groundnut',
      'Chickpea',
      'Cotton',
    ];

    for (const c of casesJson) {
      const isSupported = supportedCrops.some((crop) => crop.toLowerCase() === c.crop.toLowerCase());
      expect(isSupported, `Crop '${c.crop}' in case '${c.id}' is outside 10-crop taxonomy`).toBe(true);
    }
  });

  it('3. Every registered condition is supported in the AgronomyService knowledge base', () => {
    for (const c of casesJson) {
      const isSupported = AgronomyService.isConditionSupported(c.crop as SupportedCrop, c.expectedCondition);
      expect(
        isSupported,
        `Condition '${c.expectedCondition}' for crop '${c.crop}' is not supported in AgronomyService`
      ).toBe(true);
    }
  });

  it('4. Every imagePath stays safely inside evaluation/images directory', () => {
    for (const c of casesJson) {
      const fullPath = path.resolve(imagesDir, c.imagePath);
      expect(fullPath.startsWith(imagesDir), `Image path '${c.imagePath}' escapes evaluation/images directory`).toBe(true);
    }
  });

  it('5. No Chickpea evaluation case exists in cases.json', () => {
    const chickpeaCases = casesJson.filter((c: any) => c.crop.toLowerCase() === 'chickpea');
    expect(chickpeaCases.length, 'Chickpea cases must be excluded from this evaluation batch').toBe(0);
  });

  it('6. Duplicate case IDs are rejected', () => {
    const ids = casesJson.map((c: any) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('7. Duplicate image paths are rejected', () => {
    const paths = casesJson.map((c: any) => c.imagePath);
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });

  it('8. Invalid MIME file extension is rejected', () => {
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const c of casesJson) {
      const ext = path.extname(c.imagePath).toLowerCase();
      expect(validExts.includes(ext), `File extension '${ext}' for '${c.imagePath}' is invalid MIME`).toBe(true);
    }
  });

  it('9. Source manifest matches cases.json registered cases', () => {
    for (const c of casesJson) {
      const manifestItem = manifestJson.find((m: any) => m.id === c.id);
      expect(manifestItem, `Case '${c.id}' is missing from source-manifest.json`).toBeDefined();
      expect(manifestItem.expectedCondition).toBe(c.expectedCondition);
      expect(manifestItem.sourceVerificationStatus).toBe('VERIFIED_GROUNDED');
    }
  });
});
