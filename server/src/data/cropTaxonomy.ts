import { SupportedCrop } from '../types/index.js';
import { AgronomyService } from '../services/agronomy/agronomyService.js';
import { AGRONOMY_KNOWLEDGE_BASE } from './agronomy/index.js';

export interface TaxonomyCondition {
  id: string;
  name: string;
  category: 'Fungal Disease' | 'Bacterial Disease' | 'Viral Disease' | 'Pest Damage' | 'Healthy' | 'Unknown';
  severity: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical';
  description: string;
  symptoms: string[];
}

export const CROP_TAXONOMY = AGRONOMY_KNOWLEDGE_BASE;

function normalizeConditionKey(crop: SupportedCrop, conditionId: string): string {
  const prefix = `${crop.toLowerCase()}_`;
  let key = conditionId.toLowerCase();
  if (key.startsWith(prefix)) {
    key = key.substring(prefix.length);
  }
  return key;
}

export function isValidCropCondition(crop: SupportedCrop, conditionId: string): boolean {
  const normKey = normalizeConditionKey(crop, conditionId);
  return AgronomyService.isConditionSupported(crop, normKey);
}

export function getConditionById(crop: SupportedCrop, conditionId: string): TaxonomyCondition {
  const normKey = normalizeConditionKey(crop, conditionId);
  const entry = AgronomyService.getCondition(crop, normKey);

  let severity: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
  if (entry.condition === 'healthy') severity = 'Healthy';
  else if (entry.severityGuidance.toLowerCase().includes('critical')) severity = 'Critical';
  else if (entry.severityGuidance.toLowerCase().includes('high')) severity = 'High';

  return {
    id: `${crop.toLowerCase()}_${entry.condition}`,
    name: entry.displayName,
    category: entry.condition === 'healthy' ? 'Healthy' : entry.condition === 'unknown' ? 'Unknown' : 'Fungal Disease',
    severity,
    description: entry.summary,
    symptoms: entry.visibleSymptoms,
  };
}
