import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { config } from '../src/config/index.js';

describe('Stage 9.5 & Stage 11 Security Hardening & Config Tests', () => {
  it('server environment validation holds required configuration', () => {
    expect(config.openMeteoForecastUrl).toBeDefined();
    expect(config.openMeteoGeocodingUrl).toBeDefined();
    expect(config.clientOrigin).toBeDefined();
    expect(config.weatherCacheDurationMs).toBeGreaterThan(0);
  });

  it('Stage 11 setup: default AI_PROVIDER is mock and Gemini config variables exist', () => {
    expect(config.aiProvider).toBe('mock');
    expect(config.geminiModel).toBe('gemini-3.5-flash-lite');
    expect(config.geminiTimeoutMs).toBe(15000);
    expect(config.geminiMinConfidence).toBe(0.7);
  });

  it('sets security headers via Helmet middleware', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  it('rejects unallowed origin when CORS is requested', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.com');

    // CORS allowlist should not reflect untrusted origin
    const corsHeader = res.headers['access-control-allow-origin'];
    expect(corsHeader).not.toBe('https://malicious-site.com');
  });

  it('SSRF Protection: accepts only latitude/longitude and rejects arbitrary provider URLs', async () => {
    const res = await request(app)
      .get('/api/weather')
      .query({ url: 'https://evil-server.com/malware' });

    // Should return 400 Validation Error because latitude/longitude are missing
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('validates location search query parameter length strictly', async () => {
    const resShort = await request(app).get('/api/location/search').query({ q: 'a' });
    expect(resShort.status).toBe(400);
    expect(resShort.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('demonstrates different city coordinates produce distinct weather requests & snapshots', async () => {
    // Vijayawada: 16.5062, 80.648
    const vij = await request(app).get('/api/weather').query({ latitude: 16.5062, longitude: 80.648 });
    expect(vij.status).toBe(200);
    expect(vij.body.data.latitude).toBeCloseTo(16.5, 1);

    // Bengaluru: 12.9716, 77.5946
    const blr = await request(app).get('/api/weather').query({ latitude: 12.9716, longitude: 77.5946 });
    expect(blr.status).toBe(200);
    expect(blr.body.data.latitude).toBeCloseTo(13.0, 1);

    // Latitude values must be distinct between Vijayawada and Bengaluru
    expect(vij.body.data.latitude).not.toEqual(blr.body.data.latitude);
  });
});
