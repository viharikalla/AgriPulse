import { SupportedCrop } from '../../types/index.js';
import { AgronomyConditionEntry, AgronomyConditionEntrySchema } from '../../schemas/agronomySchema.js';
import { RICE_KNOWLEDGE } from './rice.js';
import { WHEAT_KNOWLEDGE } from './wheat.js';
import { MAIZE_KNOWLEDGE } from './maize.js';
import { TOMATO_KNOWLEDGE } from './tomato.js';
import { POTATO_KNOWLEDGE } from './potato.js';
import { CHILLI_KNOWLEDGE } from './chilli.js';
import { SOYBEAN_KNOWLEDGE } from './soybean.js';
import { GROUNDNUT_KNOWLEDGE } from './groundnut.js';
import { CHICKPEA_KNOWLEDGE } from './chickpea.js';
import { COTTON_KNOWLEDGE } from './cotton.js';

export const AGRONOMY_KNOWLEDGE_BASE: Record<SupportedCrop, AgronomyConditionEntry[]> = {
  Rice: RICE_KNOWLEDGE,
  Wheat: WHEAT_KNOWLEDGE,
  Maize: MAIZE_KNOWLEDGE,
  Tomato: TOMATO_KNOWLEDGE,
  Potato: POTATO_KNOWLEDGE,
  Chilli: CHILLI_KNOWLEDGE,
  Soybean: SOYBEAN_KNOWLEDGE,
  Groundnut: GROUNDNUT_KNOWLEDGE,
  Chickpea: CHICKPEA_KNOWLEDGE,
  Cotton: COTTON_KNOWLEDGE,
};

// Startup Validation: Fail fast during dev if any knowledge entry violates Zod schema
export function validateAgronomyKnowledgeBase(): void {
  const crops = Object.keys(AGRONOMY_KNOWLEDGE_BASE) as SupportedCrop[];
  let count = 0;

  for (const crop of crops) {
    const entries = AGRONOMY_KNOWLEDGE_BASE[crop];
    if (!entries || entries.length === 0) {
      throw new Error(`[Agronomy Startup Failure] Crop '${crop}' has no knowledge entries.`);
    }

    for (const entry of entries) {
      const result = AgronomyConditionEntrySchema.safeParse(entry);
      if (!result.success) {
        const errorMsg = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new Error(`[Agronomy Startup Failure] Invalid entry for ${crop}/${entry.condition}: ${errorMsg}`);
      }
      count++;
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[AgriPulse Agronomy] Validated ${count} knowledge entries across 10 crops successfully.`);
  }
}

// Execute startup validation upon module import
validateAgronomyKnowledgeBase();
