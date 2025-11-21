# Payment Integration Guide

## Overview

AlphaPath Academy supports two payment providers:
- **Stripe**: For international credit/debit card payments (USD, EUR, GBP)
- **Paystack**: For Ghana-based payments (GHS) including Mobile Money

## Setup Instructions

### 1. Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and sign up
   - Complete account verification

2. **Get API Keys**
   - Navigate to Developers → API keys
   - Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

3. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-api-domain.com/api/payments/stripe/webhook`
   - Select events to listen to:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.deleted`
   - Copy the **Webhook Secret** (starts with `whsec_`)

4. **Update .env File**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

### 2. Paystack Setup

1. **Create Paystack Account**
   - Go to [paystack.com](https://paystack.com) and sign up
   - Complete business verification (required for live mode)

2. **Get API Keys**
   - Navigate to Settings → API Keys & Webhooks
   - Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - Copy your **Public Key** (starts with `pk_test_` or `pk_live_`)

3. **Configure Webhooks**
   - Go to Settings → API Keys & Webhooks
   - Webhook URL: `https://your-api-domain.com/api/payments/paystack/webhook`
   - Enable these events:
     - `charge.success`
     - `subscription.disable`

4. **Update .env File**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   ```

## API Endpoints

### Stripe Payment Flow

#### 1. Create Payment Intent
```http
POST /api/payments/stripe/create-intent
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 49.99,
  "currency": "usd",
  "courseId": "uuid-of-course",
  "metadata": {
    "courseName": "Alpha Mindset Mastery"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 4999,
    "currency": "usd"
  }
}
```

#### 2. Client-Side Integration (Flutter)
```dart
// Use the clientSecret with Stripe SDK
import 'package:flutter_stripe/flutter_stripe.dart';

final paymentIntent = await createPaymentIntent(); // Call your API

await Stripe.instance.confirmPayment(
  paymentIntentClientSecret: paymentIntent['clientSecret'],
  data: PaymentMethodParams.card(),
);
```

### Paystack Payment Flow

#### 1. Initialize Payment
```http
POST /api/payments/paystack/initialize
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 200.00,
  "courseId": "uuid-of-course",
  "metadata": {
    "courseName": "Tech Career Growth"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxx",
    "accessCode": "xxx",
    "reference": "ref_xxx"
  }
}
```

#### 2. Redirect User
- Open `authorizationUrl` in webview or browser
- User completes payment (card, mobile money, bank transfer)
- Paystack redirects to callback URL: `/api/payments/paystack/callback?reference=ref_xxx`

#### 3. Verify Payment
```http
GET /api/payments/paystack/verify/:reference
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "reference": "ref_xxx",
    "amount": 200.00,
    "currency": "GHS",
    "email": "user@example.com"
  }
}
```

### Subscription Management

#### Create Subscription
```http
POST /api/payments/subscriptions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "planId": "uuid-of-plan",
  "tier": "premium",
  "paymentMethod": "stripe"
}
```

#### Cancel Subscription
```http
DELETE /api/payments/subscriptions/:subscriptionId
Authorization: Bearer <access_token>
```

#### Get User's Subscriptions
```http
GET /api/payments/subscriptions
Authorization: Bearer <access_token>
```

#### Get Purchase History
```http
GET /api/payments/purchases
Authorization: Bearer <access_token>
```

## Webhook Handling

### Stripe Webhooks

The system automatically processes these Stripe events:

1. **payment_intent.succeeded**
   - Creates purchase record
   - Grants course access
   - Updates user progress

2. **payment_intent.payment_failed**
   - Logs failure
   - Can trigger notification to user

3. **customer.subscription.deleted**
   - Cancels subscription
   - Downgrades user tier

### Paystack Webhooks

The system automatically processes these Paystack events:

1. **charge.success**
   - Creates purchase record
   - Grants course access
   - Updates user progress

2. **subscription.disable**
   - Cancels subscription
   - Downgrades user tier

## Testing

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

**Card Details:**
- Any future expiry date (e.g., 12/25)
- Any 3-digit CVC
- Any valid billing ZIP

### Paystack Test Cards

```
Success: 5060 6666 6666 6666 666
Decline: 5060 0000 0000 0000 003
PIN Required: 5078 5078 5078 5078 12
```

**Card Details:**
- Expiry: 01/99
- CVV: 123
- PIN (if required): 1234
- OTP: 123456

### Test Mobile Money (Paystack)

- Use Ghana numbers starting with +233
- Amount: Any amount (test mode)
- Approve payment in test prompt

## Security Best Practices

### 1. Environment Variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Webhook Verification
- Always verify webhook signatures
- Use raw body for signature verification
- Log all webhook events

### 3. Amount Handling
- Always validate amounts on backend
- Convert to smallest currency unit (cents/kobo)
- Never trust client-sent amounts

### 4. HTTPS Only
- Require HTTPS in production
- Enable secure cookies
- Use HSTS headers

## Error Handling

### Common Errors

#### Insufficient Funds
```json
{
  "success": false,
  "error": {
    "message": "Your card has insufficient funds",
    "code": "card_declined"
  }
}
```

#### Invalid Card
```json
{
  "success": false,
  "error": {
    "message": "Your card was declined",
    "code": "card_declined"
  }
}
```

#### Already Purchased
```json
{
  "success": false,
  "error": {
    "message": "Course already purchased",
    "statusCode": 400
  }
}
```

## Flutter Integration Example

### 1. Install Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter_stripe: ^10.0.0
  dio: ^5.0.0
  webview_flutter: ^4.0.0
```

### 2. Initialize Stripe

```dart
// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  Stripe.publishableKey = 'pk_test_your_key';
  await Stripe.instance.applySettings();
  
  runApp(MyApp());
}
```

### 3. Payment Service

```dart
class PaymentService {
  final Dio _dio = Dio();
  final String baseUrl = 'https://your-api.com';
  
  // Stripe payment
  Future<void> payWithStripe(String courseId, double amount) async {
    try {
      // 1. Create payment intent
      final response = await _dio.post(
        '$baseUrl/api/payments/stripe/create-intent',
        data: {
          'amount': amount,
          'currency': 'usd',
          'courseId': courseId,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $accessToken'},
        ),
      );
      
      final clientSecret = response.data['data']['clientSecret'];
      
      // 2. Present payment sheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'AlphaPath Academy',
        ),
      );
      
      await Stripe.instance.presentPaymentSheet();
      
      // Payment successful!
      print('Payment completed');
      
    } catch (e) {
      print('Payment failed: $e');
    }
  }
  
  // Paystack payment
  Future<void> payWithPaystack(String courseId, double amount) async {
    try {
      // 1. Initialize payment
      final response = await _dio.post(
        '$baseUrl/api/payments/paystack/initialize',
        data: {
          'amount': amount,
          'courseId': courseId,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $accessToken'},
        ),
      );
      
      final authUrl = response.data['data']['authorizationUrl'];
      final reference = response.data['data']['reference'];
      
      // 2. Open webview
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentWebView(url: authUrl),
        ),
      );
      
      // 3. Verify payment
      if (result == 'success') {
        final verifyResponse = await _dio.get(
          '$baseUrl/api/payments/paystack/verify/$reference',
          options: Options(
            headers: {'Authorization': 'Bearer $accessToken'},
          ),
        );
        
        if (verifyResponse.data['data']['status'] == 'success') {
          print('Payment completed');
        }
      }
      
    } catch (e) {
      print('Payment failed: $e');
    }
  }
}
```

## Pricing Structure

### Course Purchases (One-time)
- Alpha Mindset: $49.99 USD / GHS 600
- Tech Skills: $79.99 USD / GHS 900
- Life Mastery: $59.99 USD / GHS 700
- Full Bundle: $149.99 USD / GHS 1,800

### Subscription Tiers
- **Free**: Limited access
- **Basic**: $9.99/month or GHS 120/month
- **Premium**: $29.99/month or GHS 360/month
- **Lifetime**: $499.99 one-time or GHS 6,000 one-time

## Monitoring & Analytics

### Key Metrics to Track
- Payment success rate
- Average transaction value
- Revenue by payment method
- Failed payment reasons
- Subscription churn rate

### Stripe Dashboard
- View all transactions
- Analyze payment trends
- Export financial reports
- Manage disputes

### Paystack Dashboard
- Monitor transactions
- Track mobile money payments
- View settlement reports
- Handle refunds

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Webhook URL is publicly accessible (not localhost)
2. SSL certificate is valid
3. Endpoint returns 200 status
4. Signature verification is correct

**Solution:**
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
stripe trigger payment_intent.succeeded
```

### Payment Intent Creation Fails

**Check:**
1. API keys are correct
2. Amount is > 0
3. Currency is supported
4. Stripe account is active

### Paystack Payment Not Completing

**Check:**
1. Callback URL is correct
2. Reference is being tracked
3. Webhook signature is valid
4. User completes payment flow

## Support

For payment integration support:
- **Stripe**: https://support.stripe.com
- **Paystack**: https://support.paystack.com
- **AlphaPath**: support@alphapath.com

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Paystack API Documentation](https://paystack.com/docs/api)
- [Flutter Stripe Package](https://pub.dev/packages/flutter_stripe)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)
