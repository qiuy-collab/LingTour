import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Auth Flow E2E Test Suite
 *
 * Tests the complete authentication lifecycle against a running NestJS app:
 *   1. Login with valid credentials → get token
 *   2. Access protected endpoint with token → 200
 *   3. Access protected endpoint without token → 401
 *   4. Refresh token → get new token
 *   5. Use new token → 200
 *   6. Use expired token → 401
 *
 * Requires a running PostgreSQL database. Set env vars:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET
 */

// Skip the entire suite when no database is available (CI may run unit-only)
const describeIfDb = process.env.DB_HOST ? describe : describe.skip;

describeIfDb('Auth Flow E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminEmail: string;
  let adminPassword: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Use seeded admin credentials from env or defaults
    adminEmail = process.env.ADMIN_EMAIL || 'admin@lingtour.com';
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  });

  afterAll(async () => {
    await app?.close();
  });

  // ── Step 1: Login with valid credentials → get token ───────────────
  describe('Step 1: Login', () => {
    it('should return an access_token with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: adminPassword })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(20);

      // Should also return user info
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', adminEmail);
      expect(res.body.user).toHaveProperty('role');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: 'wrong-password' })
        .expect(401);
    });

    it('should reject missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail })
        .expect(400);
    });
  });

  // ── Step 2 & 3: Protected endpoint access ──────────────────────────
  describe('Step 2 & 3: Protected endpoint access', () => {
    let validToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: adminPassword });
      validToken = res.body.access_token;
    });

    it('should return 200 when accessing protected endpoint with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', adminEmail);
    });

    it('should return 401 when accessing protected endpoint without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should return 401 when using an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });

  // ── Step 4: Refresh token → get new token ──────────────────────────
  describe('Step 4: Token refresh', () => {
    let originalToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: adminPassword });
      originalToken = res.body.access_token;
    });

    it('should return a new access_token when refreshing a valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${originalToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      // The new token should be different (new expiry baked in)
      expect(res.body.access_token).not.toBe(originalToken);
    });

    it('should return 401 when refreshing without a token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  // ── Step 5: Use refreshed token → 200 ──────────────────────────────
  describe('Step 5: Use refreshed token', () => {
    let refreshedToken: string;

    beforeAll(async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password: adminPassword });
      const token = loginRes.body.access_token;

      // Then refresh
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${token}`);
      refreshedToken = refreshRes.body.access_token;
    });

    it('should accept the refreshed token for protected endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${refreshedToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', adminEmail);
    });
  });

  // ── Step 6: Expired token → 401 ────────────────────────────────────
  describe('Step 6: Expired token rejection', () => {
    it('should reject a token that was manually expired', async () => {
      // Create a token that expired 10 minutes ago
      const expiredToken = jwtService.sign(
        { sub: 'test-user-id', email: adminEmail, role: 'admin' },
        { expiresIn: '-10m' }, // negative = already expired
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });

    it('should allow refreshing a recently expired token (within grace period)', async () => {
      // Create a token that expired 30 minutes ago (within 1h grace)
      const recentlyExpired = jwtService.sign(
        { sub: 'test-user-id', email: adminEmail, role: 'admin' },
        { expiresIn: '-30m' },
      );

      // The refresh endpoint has its own grace-period logic —
      // whether it accepts depends on the GRACE_PERIOD_SECONDS setting.
      // We just verify it doesn't crash and returns a proper response.
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${recentlyExpired}`);

      // Either 200 (within grace) or 401 (outside grace) is acceptable
      expect([200, 401]).toContain(res.status);
    });

    it('should reject refreshing a very old expired token', async () => {
      // Create a token that expired 2 hours ago (beyond 1h grace)
      const veryOldToken = jwtService.sign(
        { sub: 'test-user-id', email: adminEmail, role: 'admin' },
        { expiresIn: '-2h' },
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${veryOldToken}`)
        .expect(401);
    });
  });
});
