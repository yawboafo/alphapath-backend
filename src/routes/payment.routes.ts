import express from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createStripeIntent,
  initializePaystackPayment,
  verifyPaystackPayment,
  paystackCallback,
  createSubscription,
  cancelSubscription,
  getUserSubscriptions,
  getUserPurchases,
  handleStripeWebhook,
  handlePaystackWebhook,
} from '../controllers/paymentController';
import {
  createPaymentIntentSchema,
  createSubscriptionSchema,
} from '../utils/validation';

const router = express.Router();

// Stripe routes
router.post(
  '/stripe/create-intent',
  authenticate,
  validate(createPaymentIntentSchema),
  asyncHandler(createStripeIntent)
);

router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }), // Raw body for webhook verification
  asyncHandler(handleStripeWebhook)
);

// Paystack routes
router.post(
  '/paystack/initialize',
  authenticate,
  validate(createPaymentIntentSchema),
  asyncHandler(initializePaystackPayment)
);

router.get('/paystack/verify/:reference', authenticate, asyncHandler(verifyPaystackPayment));

router.get('/paystack/callback', asyncHandler(paystackCallback));

router.post(
  '/paystack/webhook',
  express.raw({ type: 'application/json' }), // Raw body for webhook verification
  asyncHandler(handlePaystackWebhook)
);

// Subscription routes
router.post(
  '/subscriptions',
  authenticate,
  validate(createSubscriptionSchema),
  asyncHandler(createSubscription)
);

router.delete('/subscriptions/:id', authenticate, asyncHandler(cancelSubscription));

router.get('/subscriptions', authenticate, asyncHandler(getUserSubscriptions));

// Purchase history
router.get('/purchases', authenticate, asyncHandler(getUserPurchases));

export default router;
