import { Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../types/express';
import { PaymentService } from '../services/paymentService';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';
import logger from '../utils/logger';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

/**
 * Create Stripe payment intent
 * POST /api/payments/stripe/create-intent
 */
export const createStripeIntent = async (req: AuthRequest, res: Response) => {
  const { amount, currency, courseId, metadata } = req.body;
  const userId = req.user!.id;

  const result = await PaymentService.createStripePaymentIntent({
    amount,
    currency: currency || 'usd',
    courseId,
    userId,
    metadata,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Initialize Paystack payment
 * POST /api/payments/paystack/initialize
 */
export const initializePaystackPayment = async (req: AuthRequest, res: Response) => {
  const { amount, courseId, metadata } = req.body;
  const userId = req.user!.id;
  const email = req.user!.email;

  const result = await PaymentService.initializePaystackPayment({
    amount,
    email,
    courseId,
    userId,
    currency: 'GHS',
    metadata,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Verify Paystack payment
 * GET /api/payments/paystack/verify/:reference
 */
export const verifyPaystackPayment = async (req: AuthRequest, res: Response) => {
  const { reference } = req.params;

  const result = await PaymentService.verifyPaystackPayment(reference);

  // If payment successful and has course metadata, process purchase
  if (result.status === 'success' && result.metadata?.courseId && result.metadata?.userId) {
    await PaymentService.processPurchase(
      result.metadata.userId,
      result.metadata.courseId,
      result.amount,
      'paystack',
      reference
    );
  }

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Paystack payment callback (redirect URL)
 * GET /api/payments/paystack/callback
 */
export const paystackCallback = async (req: AuthRequest, res: Response) => {
  const { reference } = req.query;

  if (!reference) {
    throw new AppError('Payment reference is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const result = await PaymentService.verifyPaystackPayment(reference as string);

    // Redirect to success or failure page
    const redirectUrl =
      result.status === 'success'
        ? `${config.clientUrl}/payment/success?reference=${reference}`
        : `${config.clientUrl}/payment/failed?reference=${reference}`;

    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Paystack callback error:', error);
    res.redirect(`${config.clientUrl}/payment/failed`);
  }
};

/**
 * Create subscription
 * POST /api/payments/subscriptions
 */
export const createSubscription = async (req: AuthRequest, res: Response) => {
  const { planId, tier, paymentMethod } = req.body;
  const userId = req.user!.id;

  const subscription = await PaymentService.createSubscription({
    userId,
    planId,
    tier,
    paymentMethod,
  });

  res.status(201).json({
    success: true,
    data: subscription,
    message: 'Subscription created successfully',
  });
};

/**
 * Cancel subscription
 * DELETE /api/payments/subscriptions/:id
 */
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const subscription = await PaymentService.cancelSubscription(id);

  res.status(200).json({
    success: true,
    data: subscription,
    message: 'Subscription cancelled successfully',
  });
};

/**
 * Get user's subscriptions
 * GET /api/payments/subscriptions
 */
export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await PaymentService.getUserSubscriptions(userId);

  res.status(200).json({
    success: true,
    data: subscriptions,
  });
};

/**
 * Get user's purchase history
 * GET /api/payments/purchases
 */
export const getUserPurchases = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const purchases = await PaymentService.getUserPurchases(userId);

  res.status(200).json({
    success: true,
    data: purchases,
  });
};

/**
 * Stripe webhook handler
 * POST /api/payments/stripe/webhook
 */
export const handleStripeWebhook = async (req: AuthRequest, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    throw new AppError('Missing Stripe signature', 400, 'INVALID_SIGNATURE');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (error) {
    logger.error('Stripe webhook signature verification failed:', error);
    throw new AppError('Invalid signature', 400, 'INVALID_SIGNATURE');
  }

  await PaymentService.handleStripeWebhook(event);

  res.status(200).json({ received: true });
};

/**
 * Paystack webhook handler
 * POST /api/payments/paystack/webhook
 */
export const handlePaystackWebhook = async (req: AuthRequest, res: Response) => {
  const hash = req.headers['x-paystack-signature'] as string;

  if (!hash) {
    throw new AppError('Missing Paystack signature', 400, 'INVALID_SIGNATURE');
  }

  // Verify webhook signature
  const crypto = require('crypto');
  const expectedHash = crypto
    .createHmac('sha512', config.paystack.secretKey)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== expectedHash) {
    throw new AppError('Invalid signature', 400, 'INVALID_SIGNATURE');
  }

  await PaymentService.handlePaystackWebhook(req.body);

  res.status(200).json({ received: true });
};
