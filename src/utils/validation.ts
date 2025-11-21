import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  fullName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must not exceed 255 characters',
    'any.required': 'Full name is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  avatarUrl: Joi.string().uri().optional(),
});

export const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().valid('alpha', 'tech', 'life', 'mentorship').required(),
  thumbnailUrl: Joi.string().uri().optional(),
  price: Joi.number().min(0).required(),
  duration: Joi.string().optional(),
});

export const createLessonSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  sectionTitle: Joi.string().max(255).optional(),
  title: Joi.string().min(3).max(255).required(),
  videoUrl: Joi.string().uri().optional(),
  duration: Joi.string().optional(),
  orderIndex: Joi.number().integer().min(0).required(),
  isPreview: Joi.boolean().default(false),
});

export const updateProgressSchema = Joi.object({
  progressPercentage: Joi.number().min(0).max(100).required(),
  completed: Joi.boolean().optional(),
});

export const createPostSchema = Joi.object({
  category: Joi.string().valid('alpha', 'tech', 'life', 'general').required(),
  title: Joi.string().min(3).max(255).required(),
  content: Joi.string().min(10).required(),
});

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

export const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
});

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().min(0.01).required().messages({
    'number.min': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  currency: Joi.string().valid('usd', 'ghs', 'eur', 'gbp').optional(),
  courseId: Joi.string().uuid().optional(),
  metadata: Joi.object().optional(),
});

export const createSubscriptionSchema = Joi.object({
  planId: Joi.string().uuid().required(),
  tier: Joi.string().valid('free', 'basic', 'premium', 'lifetime').required(),
  paymentMethod: Joi.string().valid('stripe', 'paystack').required(),
});
