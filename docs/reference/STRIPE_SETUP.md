# Stripe Payment Integration Setup

This application includes Stripe payment integration for template purchases. To enable this feature, you need to configure the Stripe publishable key.

## Environment Variables

Create a `.env` file in the root directory of your project and add the following variable:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Getting Your Stripe Publishable Key

1. Sign up for a Stripe account at [https://stripe.com](https://stripe.com)
2. Navigate to the Stripe Dashboard
3. Go to Developers > API keys
4. Copy your publishable key (starts with `pk_test_` for test mode or `pk_live_` for live mode)

## Backend API Endpoints

The frontend expects the following backend API endpoints to be implemented:

### Create Payment Intent
```
POST /Stripe/CreatePaymentIntent
```

Request body:
```json
{
  "templateId": "string",
  "amount": "number (in cents)",
  "currency": "string (e.g., 'usd')",
  "description": "string",
  "UserId": "number",
  "ActionBy": "number"
}
```

Response:
```json
{
  "result": true,
  "message": "string",
  "data": {
    "clientSecret": "string"
  }
}
```

## Features

- **Template Purchase Modal**: When users click "Add Template" on a paid template, a payment modal appears
- **Stripe Elements**: Secure card input using Stripe Elements
- **Payment Processing**: Real-time payment processing with error handling
- **Free Templates**: Templates with no price or price of 0 are added directly without payment
- **Responsive Design**: Payment modal works on desktop and mobile devices
- **Dark Mode Support**: Payment form adapts to light/dark theme

## Error Handling

The application handles various error scenarios:
- Missing Stripe configuration
- Payment processing errors
- Network connectivity issues
- Invalid card information

## Testing

For testing, use Stripe's test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995

## Security Notes

- Never expose your Stripe secret key in the frontend
- Always use HTTPS in production
- Implement proper server-side validation for all payment operations
- Follow Stripe's security best practices 