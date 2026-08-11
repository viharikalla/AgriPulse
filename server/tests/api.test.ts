import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('AgriPulse Express API Endpoints', () => {
  it('GET /api/health returns HTTP 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.headers).toHaveProperty('x-session-id');
  });

  it('POST /api/assistant answers questions cleanly', async () => {
    const res = await request(app)
      .post('/api/assistant')
      .send({
        question: 'When is the best spray window for tomato early blight?',
        contextCrop: 'Tomato',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
  });

  it('POST /api/assistant rejects short invalid questions', async () => {
    const res = await request(app)
      .post('/api/assistant')
      .send({
        question: 'Hi',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/history returns session history array', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('X-Session-ID', 'sid_test_session_123');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
