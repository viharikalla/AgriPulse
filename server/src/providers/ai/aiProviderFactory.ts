import { AIProvider } from './AIProvider.js';
import { MockAIProvider } from './MockAIProvider.js';
import { GeminiVisionProvider } from './GeminiVisionProvider.js';
import { config } from '../../config/index.js';

export function getAIProvider(providerType?: string): AIProvider {
  const type = providerType || config.aiProvider;
  if (type === 'gemini') {
    return new GeminiVisionProvider();
  }
  return new MockAIProvider();
}
