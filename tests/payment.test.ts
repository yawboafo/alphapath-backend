import request from 'supertest';
import { app } from '../src/server';
import db from '../src/config/database';

describe('Payment API Tests', () => {
  let accessToken: string;
  let userId: string;
  let courseId: string;

  beforeAll(async () => {
    // Register and login to get access token
    const registerResponse = await request(app).post('/api/auth/register').send({
      email: 'payment-test@example.com',
      password: 'Test1234',
      fullName: 'Payment Test User',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'payment-test@example.com',
      password: 'Test1234',
    });

    accessToken = loginResponse.body.data.accessToken;
    userId = loginResponse.body.data.user.id;

    // Create a test course
    const courseResult = await db.query(
      `INSERT INTO courses (title, description, category, price, instructor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Test Course', 'Test Description', 'tech', 49.99, userId]
    );
    courseId = courseResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.query('DELETE FROM purchases WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM courses WHERE id = $1', [courseId]);
    await db.query('DELETE FROM users WHERE email = $1', ['payment-test@example.com']);
    await db.close();
  });

  describe('Stripe Payment Intent', () => {
    it('should create a Stripe payment intent', async () => {
      const response = await request(app)
        .post('/api/payments/stripe/create-intent')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 49.99,
          currency: 'usd',
          courseId: courseId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('clientSecret');
      expect(response.body.data).toHaveProperty('paymentIntentId');
      expect(response.body.data.amount).toBe(4999); // In cents
      expect(response.body.data.currency).toBe('usd');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/stripe/create-intent')
        .send({
          amount: 49.99,
          currency: 'usd',
          courseId: courseId,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid amount', async () => {
      const response = await request(app)
        .post('/api/payments/stripe/create-intent')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: -10,
          currency: 'usd',
          courseId: courseId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Paystack Payment', () => {
    it('should initialize Paystack payment', async () => {
      const response = await request(app)
        .post('/api/payments/paystack/initialize')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 200.0,
          courseId: courseId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('authorizationUrl');
      expect(response.body.data).toHaveProperty('accessCode');
      expect(response.body.data).toHaveProperty('reference');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/payments/paystack/initialize').send({
        amount: 200.0,
        courseId: courseId,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Subscriptions', () => {
    it('should create a subscription', async () => {
      // First create a plan
      const planResult = await db.query(
        `INSERT INTO courses (title, description, category, price, instructor_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Premium Plan', 'Premium subscription', 'tech', 29.99, userId]
      );
      const planId = planResult.rows[0].id;

      const response = await request(app)
        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          planId: planId,
          tier: 'premium',
          paymentMethod: 'stripe',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.tier).toBe('premium');
      expect(response.body.data.status).toBe('active');

      // Cleanup
      await db.query('DELETE FROM courses WHERE id = $1', [planId]);
    });

    it('should get user subscriptions', async () => {
      const response = await request(app)
        .get('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should cancel a subscription', async () => {
      // Create subscription first
      const planResult = await db.query(
        `INSERT INTO courses (title, description, category, price, instructor_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Basic Plan', 'Basic subscription', 'tech', 9.99, userId]
      );
      const planId = planResult.rows[0].id;

      const createResponse = await request(app)
        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          planId: planId,
          tier: 'basic',
          paymentMethod: 'stripe',
        });

      const subscriptionId = createResponse.body.data.id;

      // Cancel subscription
      const response = await request(app)
        .delete(`/api/payments/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');

      // Cleanup
      await db.query('DELETE FROM courses WHERE id = $1', [planId]);
    });
  });

  describe('Purchase History', () => {
    it('should get user purchase history', async () => {
      const response = await request(app)
        .get('/api/payments/purchases')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/payments/purchases');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Webhook Validation', () => {
    it('should reject Stripe webhook without signature', async () => {
      const response = await request(app)
        .post('/api/payments/stripe/webhook')
        .send({
          type: 'payment_intent.succeeded',
          data: {},
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject Paystack webhook without signature', async () => {
      const response = await request(app)
        .post('/api/payments/paystack/webhook')
        .send({
          event: 'charge.success',
          data: {},
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
