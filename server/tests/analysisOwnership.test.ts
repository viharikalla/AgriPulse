import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { AuthService } from '../src/services/auth/authService.js';
import { InMemUserStore } from '../src/models/User.js';
import { InMemAnalysisStore } from '../src/models/Analysis.js';
import { ImageProcessingService } from '../src/services/imageProcessingService.js';

describe('Stage 11J & Production History Persistence & Isolation Tests', () => {
  beforeEach(() => {
    InMemUserStore.clear();
    InMemAnalysisStore.clear();

    vi.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
      buffer: Buffer.from('mock processed image'),
      imageQuality: {
        isValid: true,
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        resized: true,
        qualityNotes: 'Test image processed successfully.',
      },
    });
  });

  it('1. FieldAnalysis created by User A is saved with userId and accessible by User A', async () => {
    const userA = await AuthService.signup({
      name: 'User A',
      email: 'usera@agripulse.io',
      password: 'Password123!',
    });
    const tokenA = AuthService.generateToken(userA);

    const analyzeRes = await request(app)
      .post('/api/analyze')
      .set('Cookie', [`agripulse_session=${tokenA}`])
      .field('crop', 'Tomato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    expect(analyzeRes.status).toBe(200);
    const analysisId = analyzeRes.body.data.id;
    expect(analyzeRes.body.data.userId).toBe(userA.id);

    const getRes = await request(app)
      .get(`/api/analysis/${analysisId}`)
      .set('Cookie', [`agripulse_session=${tokenA}`]);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(analysisId);
  });

  it('2. User B cannot access User A analysis record by changing URL ID', async () => {
    const userA = await AuthService.signup({
      name: 'User A',
      email: 'usera@agripulse.io',
      password: 'Password123!',
    });
    const userB = await AuthService.signup({
      name: 'User B',
      email: 'userb@agripulse.io',
      password: 'Password123!',
    });

    const tokenA = AuthService.generateToken(userA);
    const tokenB = AuthService.generateToken(userB);

    const analyzeRes = await request(app)
      .post('/api/analyze')
      .set('Cookie', [`agripulse_session=${tokenA}`])
      .field('crop', 'Tomato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    const analysisId = analyzeRes.body.data.id;

    // User B attempts to access User A's analysis
    const getRes = await request(app)
      .get(`/api/analysis/${analysisId}`)
      .set('Cookie', [`agripulse_session=${tokenB}`]);

    expect(getRes.status).toBe(404);
    expect(getRes.body.error.message).toContain('not found or access denied');
  });

  it('3. User A history returns only User A analyses and survives fresh request/session', async () => {
    const userA = await AuthService.signup({
      name: 'User A',
      email: 'usera@agripulse.io',
      password: 'Password123!',
    });
    const userB = await AuthService.signup({
      name: 'User B',
      email: 'userb@agripulse.io',
      password: 'Password123!',
    });

    const tokenA = AuthService.generateToken(userA);
    const tokenB = AuthService.generateToken(userB);

    // Create analysis for User A
    await request(app)
      .post('/api/analyze')
      .set('Cookie', [`agripulse_session=${tokenA}`])
      .field('crop', 'Tomato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    // Create analysis for User B
    await request(app)
      .post('/api/analyze')
      .set('Cookie', [`agripulse_session=${tokenB}`])
      .field('crop', 'Potato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    // Fresh session token for User A
    const freshTokenA = AuthService.generateToken(userA);
    const historyResA = await request(app)
      .get('/api/history')
      .set('Cookie', [`agripulse_session=${freshTokenA}`]);

    expect(historyResA.status).toBe(200);
    expect(historyResA.body.data.length).toBe(1);
    expect(historyResA.body.data[0].crop.name).toBe('Tomato');

    const historyResB = await request(app)
      .get('/api/history')
      .set('Cookie', [`agripulse_session=${tokenB}`]);

    expect(historyResB.status).toBe(200);
    expect(historyResB.body.data.length).toBe(1);
    expect(historyResB.body.data[0].crop.name).toBe('Potato');
  });

  it('4. Empty user history returns a safe empty array state', async () => {
    const newOwner = await AuthService.signup({
      name: 'New Owner',
      email: 'newowner@agripulse.io',
      password: 'Password123!',
    });
    const token = AuthService.generateToken(newOwner);

    const historyRes = await request(app)
      .get('/api/history')
      .set('Cookie', [`agripulse_session=${token}`]);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(Array.isArray(historyRes.body.data)).toBe(true);
    expect(historyRes.body.data.length).toBe(0);
  });
});
