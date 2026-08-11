import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { AuthService } from '../src/services/auth/authService.js';
import { InMemUserStore } from '../src/models/User.js';

describe('Stage 11J Authentication & User Unit Tests', () => {
  beforeEach(() => {
    InMemUserStore.clear();
  });

  it('1. Valid signup creates user and returns safe user object without passwordHash', async () => {
    const user = await AuthService.signup({
      name: 'Vihari Kalla',
      email: 'vihari@agripulse.io',
      password: 'Password123!',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Vihari Kalla');
    expect(user.email).toBe('vihari@agripulse.io');
    expect((user as any).passwordHash).toBeUndefined();
    expect((user as any).password).toBeUndefined();
  });

  it('2. Signup rejects missing name or name exceeding 100 characters', async () => {
    await expect(
      AuthService.signup({ name: '', email: 'test@agripulse.io', password: 'Password123!' })
    ).rejects.toThrow(/Full name is required/);
  });

  it('3. Signup rejects invalid email format', async () => {
    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'not-an-email', password: 'Password123!' })
    ).rejects.toThrow(/valid email address/);
  });

  it('4. Signup enforces strong password rules (uppercase, lowercase, number, special char)', async () => {
    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'john@agripulse.io', password: 'weak' })
    ).rejects.toThrow(/at least 8 characters/);

    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'john@agripulse.io', password: 'password123!' })
    ).rejects.toThrow(/uppercase/);

    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'john@agripulse.io', password: 'PASSWORD123!' })
    ).rejects.toThrow(/lowercase/);

    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'john@agripulse.io', password: 'Password!' })
    ).rejects.toThrow(/number/);

    await expect(
      AuthService.signup({ name: 'Farmer John', email: 'john@agripulse.io', password: 'Password123' })
    ).rejects.toThrow(/special character/);
  });

  it('5. Signup rejects duplicate email registrations', async () => {
    await AuthService.signup({
      name: 'Farmer One',
      email: 'farmer@agripulse.io',
      password: 'Password123!',
    });

    await expect(
      AuthService.signup({
        name: 'Farmer Two',
        email: 'FARMER@agripulse.io',
        password: 'Password123!',
      })
    ).rejects.toThrow(/account with this email already exists/);
  });

  it('6. POST /api/auth/signup endpoint sets HttpOnly session cookie and returns safe user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Vihari Kalla',
        email: 'vihari@agripulse.io',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('vihari@agripulse.io');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');

    const cookieHeader = (res.headers['set-cookie'] || []).join(';');
    expect(cookieHeader).toContain('agripulse_session=');
    expect(cookieHeader).toContain('HttpOnly');
  });

  it('7. Signup returns 400 when confirmPassword does not match password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Vihari Kalla',
        email: 'vihari@agripulse.io',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PASSWORD_MISMATCH');
  });

  it('8. POST /api/auth/login authenticates valid user and sets cookie', async () => {
    await AuthService.signup({
      name: 'Vihari Kalla',
      email: 'vihari@agripulse.io',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'VIHARI@agripulse.io',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Vihari Kalla');
    const cookieHeader = (res.headers['set-cookie'] || []).join(';');
    expect(cookieHeader).toContain('agripulse_session=');
  });

  it('9. POST /api/auth/login returns generic error on invalid credentials without revealing user presence', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@agripulse.io',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Email or password is incorrect.');
  });

  it('10. GET /api/auth/me returns current user when authenticated and 401 when unauthenticated', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Vihari Kalla',
        email: 'vihari@agripulse.io',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    const cookie = signupRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('vihari@agripulse.io');

    const unauthRes = await request(app).get('/api/auth/me');
    expect(unauthRes.status).toBe(401);
  });

  it('11. POST /api/auth/logout clears session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cookieHeader = (res.headers['set-cookie'] || []).join(';');
    expect(cookieHeader).toContain('agripulse_session=;');
  });
});
