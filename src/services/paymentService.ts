import Stripe from 'stripe';
import axios from 'axios';
import { config } from '../config';
import db from '../config/database';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// Initialize Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

// Paystack API base URL
const PAYSTACK_API_URL = 'https://api.paystack.co';

interface PaymentIntentData {
  amount: number;
  currency: string;
  courseId?: string;
  userId: string;
  metadata?: Record<string, any>;
}

interface SubscriptionData {
  userId: string;
  planId: string;
  tier: 'free' | 'basic' | 'premium' | 'lifetime';
  paymentMethod: 'stripe' | 'paystack';
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed';
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
    };
    metadata?: Record<string, any>;
  };
}

export class PaymentService {
  /**
   * Create Stripe payment intent
   */
  static async createStripePaymentIntent(data: PaymentIntentData) {
    try {
      const { amount, currency, courseId, userId, metadata } = data;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          courseId: courseId || '',
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      throw new AppError('Failed to create payment intent', 500, 'PAYMENT_FAILED');
    }
  }

  /**
   * Initialize Paystack payment
   */
  static async initializePaystackPayment(data: PaymentIntentData & { email: string }) {
    try {
      const { amount, email, courseId, userId, metadata } = data;

      const response = await axios.post<PaystackInitializeResponse>(
        `${PAYSTACK_API_URL}/transaction/initialize`,
        {
          amount: Math.round(amount * 100), // Convert to kobo (GHS)
          email,
          currency: 'GHS',
          metadata: {
            userId,
            courseId: courseId || '',
            ...metadata,
          },
          callback_url: `${config.apiUrl}/api/payments/paystack/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${config.paystack.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.status) {
        throw new AppError('Failed to initialize Paystack payment', 500, 'PAYMENT_FAILED');
      }

      logger.info(`Paystack payment initialized: ${response.data.data.reference}`);

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      logger.error('Error initializing Paystack payment:', error);
      throw new AppError('Failed to initialize payment', 500, 'PAYMENT_FAILED');
    }
  }

  /**
   * Verify Paystack payment
   */
  static async verifyPaystackPayment(reference: string) {
    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${config.paystack.secretKey}`,
          },
        }
      );

      if (!response.data.status) {
        throw new AppError('Payment verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
      }

      const { data: transaction } = response.data;

      return {
        status: transaction.status,
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo
        currency: transaction.currency,
        email: transaction.customer.email,
        metadata: transaction.metadata,
      };
    } catch (error) {
      logger.error('Error verifying Paystack payment:', error);
      throw new AppError('Failed to verify payment', 500, 'PAYMENT_FAILED');
    }
  }

  /**
   * Process successful payment (create purchase record)
   */
  static async processPurchase(
    userId: string,
    courseId: string,
    amount: number,
    paymentMethod: 'stripe' | 'paystack',
    transactionId: string
  ) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if user already purchased this course
      const existingPurchase = await client.query(
        'SELECT id FROM purchases WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (existingPurchase.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new AppError('Course already purchased', 400, 'ALREADY_PURCHASED');
      }

      // Create purchase record
      const purchaseResult = await client.query(
        `INSERT INTO purchases (user_id, course_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, 'completed')
         RETURNING *`,
        [userId, courseId, amount, paymentMethod, transactionId]
      );

      // Grant course access by creating user progress entry
      await client.query(
        `INSERT INTO user_progress (user_id, course_id, progress_percentage, completed)
         VALUES ($1, $2, 0, false)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [userId, courseId]
      );

      await client.query('COMMIT');

      logger.info(`Purchase completed: User ${userId} purchased course ${courseId}`);

      return purchaseResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error processing purchase:', error);
      throw error instanceof AppError ? error : new AppError('Failed to process purchase', 500, 'PURCHASE_FAILED');
    } finally {
      client.release();
    }
  }

  /**
   * Create subscription
   */
  static async createSubscription(data: SubscriptionData) {
    try {
      const { userId, planId, tier, paymentMethod } = data;

      // Calculate end date based on tier
      let endDate: Date;
      if (tier === 'lifetime') {
        endDate = new Date('2099-12-31'); // Far future date for lifetime
      } else {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
      }

      // Create subscription record
      const result = await db.query(
        `INSERT INTO subscriptions (user_id, plan_id, tier, start_date, end_date, status, payment_method)
         VALUES ($1, $2, $3, NOW(), $4, 'active', $5)
         RETURNING *`,
        [userId, planId, tier, endDate, paymentMethod]
      );

      // Update user tier
      await db.query(
        'UPDATE users SET membership_tier = $1 WHERE id = $2',
        [tier, userId]
      );

      logger.info(`Subscription created for user ${userId}, tier: ${tier}`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw new AppError('Failed to create subscription', 500, 'SUBSCRIPTION_FAILED');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const result = await db.query(
        `UPDATE subscriptions 
         SET status = 'cancelled', end_date = NOW()
         WHERE id = $1
         RETURNING *`,
        [subscriptionId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Subscription not found', 404, 'NOT_FOUND');
      }

      const subscription = result.rows[0];

      // Downgrade user to free tier
      await db.query(
        'UPDATE users SET membership_tier = $1 WHERE id = $2',
        ['free', subscription.user_id]
      );

      logger.info(`Subscription ${subscriptionId} cancelled`);

      return subscription;
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw error instanceof AppError ? error : new AppError('Failed to cancel subscription', 500, 'SUBSCRIPTION_FAILED');
    }
  }

  /**
   * Get user's subscriptions
   */
  static async getUserSubscriptions(userId: string) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error fetching user subscriptions:', error);
      throw new AppError('Failed to fetch subscriptions', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Get user's purchase history
   */
  static async getUserPurchases(userId: string) {
    try {
      const result = await db.query(
        `SELECT p.*, c.title as course_title, c.thumbnail_url
         FROM purchases p
         LEFT JOIN courses c ON p.course_id = c.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error fetching user purchases:', error);
      throw new AppError('Failed to fetch purchases', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Handle Stripe webhook
   */
  static async handleStripeWebhook(event: Stripe.Event) {
    try {
      logger.info(`Processing Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const { userId, courseId } = paymentIntent.metadata;

          if (userId && courseId) {
            await this.processPurchase(
              userId,
              courseId,
              paymentIntent.amount / 100,
              'stripe',
              paymentIntent.id
            );
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          logger.error(`Payment failed for intent: ${paymentIntent.id}`);
          // Could send notification to user here
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          logger.info(`Subscription deleted: ${subscription.id}`);
          // Handle subscription cancellation
          break;
        }

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      throw new AppError('Webhook processing failed', 500, 'WEBHOOK_FAILED');
    }
  }

  /**
   * Handle Paystack webhook
   */
  static async handlePaystackWebhook(event: any) {
    try {
      logger.info(`Processing Paystack webhook: ${event.event}`);

      switch (event.event) {
        case 'charge.success': {
          const { reference, amount, metadata } = event.data;
          const { userId, courseId } = metadata || {};

          if (userId && courseId) {
            await this.processPurchase(
              userId,
              courseId,
              amount / 100, // Convert from kobo
              'paystack',
              reference
            );
          }
          break;
        }

        case 'subscription.disable': {
          logger.info(`Subscription disabled: ${event.data.subscription_code}`);
          // Handle subscription cancellation
          break;
        }

        default:
          logger.info(`Unhandled Paystack event: ${event.event}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error handling Paystack webhook:', error);
      throw new AppError('Webhook processing failed', 500, 'WEBHOOK_FAILED');
    }
  }
}
