# Payment Integration - Quick Start Guide

## ✅ Implementation Complete!

Payment integration has been successfully implemented with full support for Stripe and Paystack.

---

## 🚀 Quick Setup (5 Minutes)

### 1. Get API Keys

#### Stripe (International Payments)
1. Sign up at [stripe.com](https://stripe.com)
2. Go to **Developers → API keys**
3. Copy your keys:
   ```
   Secret Key: sk_test_...
   Publishable Key: pk_test_...
   ```

#### Paystack (Ghana Payments)
1. Sign up at [paystack.com](https://paystack.com)
2. Go to **Settings → API Keys**
3. Copy your keys:
   ```
   Secret Key: sk_test_...
   Public Key: pk_test_...
   ```

### 2. Update .env File

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Client URL (for redirects)
CLIENT_URL=http://localhost:3000
```

### 3. Configure Webhooks

#### Stripe Webhook
1. Go to **Developers → Webhooks**
2. Add endpoint: `https://your-domain.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
4. Copy webhook secret to `.env`

#### Paystack Webhook
1. Go to **Settings → API Keys & Webhooks**
2. Add webhook: `https://your-domain.com/api/payments/paystack/webhook`
3. Enable events:
   - `charge.success`
   - `subscription.disable`

### 4. Start Testing

```bash
# Start server
npm run dev

# Test health check
curl http://localhost:5000/health

# Import Postman collection
# File: postman_collection.json
# It includes all payment endpoints!
```

---

## 📱 Flutter Integration

### Install Packages
```yaml
# pubspec.yaml
dependencies:
  flutter_stripe: ^10.0.0
  dio: ^5.0.0
  webview_flutter: ^4.0.0
```

### Initialize Stripe
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Stripe.publishableKey = 'pk_test_your_key';
  await Stripe.instance.applySettings();
  runApp(MyApp());
}
```

### Make a Payment
```dart
// Stripe Payment
Future<void> payWithStripe(double amount, String courseId) async {
  // 1. Create payment intent from your API
  final response = await dio.post(
    'https://your-api.com/api/payments/stripe/create-intent',
    data: {'amount': amount, 'courseId': courseId},
    options: Options(headers: {'Authorization': 'Bearer $token'}),
  );
  
  // 2. Present payment sheet
  await Stripe.instance.initPaymentSheet(
    paymentSheetParameters: SetupPaymentSheetParameters(
      paymentIntentClientSecret: response.data['data']['clientSecret'],
      merchantDisplayName: 'AlphaPath Academy',
    ),
  );
  
  await Stripe.instance.presentPaymentSheet();
  // Payment successful!
}

// Paystack Payment
Future<void> payWithPaystack(double amount, String courseId) async {
  // 1. Initialize payment
  final response = await dio.post(
    'https://your-api.com/api/payments/paystack/initialize',
    data: {'amount': amount, 'courseId': courseId},
    options: Options(headers: {'Authorization': 'Bearer $token'}),
  );
  
  // 2. Open authorization URL
  final authUrl = response.data['data']['authorizationUrl'];
  await Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => PaymentWebView(url: authUrl)),
  );
}
```

---

## 🧪 Test Payments

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002

Expiry: Any future date (12/25)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)
```

### Paystack Test Cards
```
Success: 5060 6666 6666 6666 666
Decline: 5060 0000 0000 0000 003

Expiry: 01/99
CVV: 123
PIN: 1234 (if requested)
OTP: 123456 (if requested)
```

---

## 📡 Available Endpoints

### Create Payment (Stripe)
```bash
POST /api/payments/stripe/create-intent
Authorization: Bearer YOUR_TOKEN

{
  "amount": 49.99,
  "currency": "usd",
  "courseId": "course-uuid"
}
```

### Initialize Payment (Paystack)
```bash
POST /api/payments/paystack/initialize
Authorization: Bearer YOUR_TOKEN

{
  "amount": 200.00,
  "courseId": "course-uuid"
}
```

### Create Subscription
```bash
POST /api/payments/subscriptions
Authorization: Bearer YOUR_TOKEN

{
  "planId": "plan-uuid",
  "tier": "premium",
  "paymentMethod": "stripe"
}
```

### Get Purchase History
```bash
GET /api/payments/purchases
Authorization: Bearer YOUR_TOKEN
```

**See full API documentation in**: `API_DOCUMENTATION.md`

---

## 💡 How It Works

### Payment Flow
```
1. User selects course → 
2. Frontend calls /create-intent → 
3. Backend creates payment intent → 
4. User completes payment → 
5. Webhook receives confirmation → 
6. Backend grants course access → 
7. User can access course!
```

### What Happens Automatically
- ✅ Payment intent creation with metadata
- ✅ Webhook signature verification
- ✅ Purchase record creation in database
- ✅ Course access granting
- ✅ User progress tracking initialization
- ✅ Duplicate purchase prevention
- ✅ Error handling and logging

---

## 🔒 Security

✅ **Implemented**:
- Webhook signature verification (both Stripe & Paystack)
- Server-side amount validation
- JWT authentication on all endpoints
- SQL injection protection
- Error handling without exposing internals

⚠️ **Important**:
- Never trust payment amounts from client
- Always verify webhooks
- Use HTTPS in production
- Keep API keys in environment variables
- Rotate keys regularly

---

## 📊 Monitoring

### Where to Check Payments

**Stripe Dashboard**: https://dashboard.stripe.com
- View all transactions
- Check webhook deliveries
- Monitor failed payments
- Export reports

**Paystack Dashboard**: https://dashboard.paystack.com
- Monitor transactions
- Check mobile money payments
- View settlement reports
- Handle refunds

**Application Logs**: `logs/combined.log`
```bash
tail -f logs/combined.log | grep payment
```

---

## 🐛 Troubleshooting

### Payment Not Working?

**1. Check API Keys**
```bash
# Verify keys are set
echo $STRIPE_SECRET_KEY
echo $PAYSTACK_SECRET_KEY
```

**2. Check Webhooks**
```bash
# Install Stripe CLI for local testing
brew install stripe/stripe-cli/stripe
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
```

**3. Check Logs**
```bash
# View error logs
tail -f logs/error.log

# View all payment logs
grep -i payment logs/combined.log
```

### Common Issues

**"Invalid signature"**
- Webhook secret is wrong in `.env`
- Request body was modified before verification
- Using test keys with live webhooks

**"Payment intent creation failed"**
- Check Stripe API keys
- Verify amount is > 0.50 USD
- Check Stripe account status

**"Paystack initialization failed"**
- Verify Paystack API keys
- Check amount format (should be number)
- Ensure user email is valid

---

## 📚 Complete Documentation

| Document | Description |
|----------|-------------|
| **PAYMENT_INTEGRATION_GUIDE.md** | Complete setup & usage guide |
| **PAYMENT_IMPLEMENTATION.md** | Technical implementation details |
| **API_DOCUMENTATION.md** | All API endpoints with examples |
| **postman_collection.json** | Import and test immediately |

---

## ✅ What's Included

- [x] Stripe payment intent creation
- [x] Paystack payment initialization
- [x] Payment verification
- [x] Webhook handlers (both providers)
- [x] Subscription management
- [x] Purchase history
- [x] Automatic course access
- [x] Error handling
- [x] Security (signatures, validation)
- [x] Complete documentation
- [x] Postman collection
- [x] Test suite
- [x] Flutter examples

---

## 🎉 You're Ready!

Your payment system is fully implemented and ready to accept payments!

**Next Steps**:
1. ✅ Add API keys to `.env`
2. ✅ Configure webhooks
3. ✅ Test with test cards
4. ✅ Integrate with Flutter app
5. 🚀 Launch and start earning!

**Need Help?**
- Check `PAYMENT_INTEGRATION_GUIDE.md` for detailed guide
- Review `API_DOCUMENTATION.md` for endpoint details
- Test with Postman collection
- Review logs in `logs/` folder

---

**Built with ❤️ for AlphaPath Academy** 🇬🇭🚀
