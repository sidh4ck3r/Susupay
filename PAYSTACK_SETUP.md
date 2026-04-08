# Paystack Integration Guide for SusuPay

This document outlines how to activate and secure the Paystack payment gateway for SusuPay.

## 1. Credentials Setup

Add your Paystack keys to the following environment files:

### Backend (`server/.env`)
```env
PAYSTACK_SECRET_KEY=sk_test_xxx...
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx...
```

## 2. Webhook Configuration

For real-time balance updates, you must configure your Paystack Webhook:

1. Go to **Settings > API Keys & Webhooks** in your Paystack Dashboard.
2. Set the **Webhook URL** to:
   `https://your-api-domain.com/api/paystack/webhook`
3. The system automatically verifies the `x-paystack-signature` to ensure security.

## 3. Withdrawal Logic (Automated Payouts)

The system is configured to support GH Mobile Money networks:
- **MTN**: Map to `mtn` bank code.
- **Telecel (Vodafone)**: Map to `vod` bank code.
- **AT (AirtelTigo)**: Map to `tgo` bank code.

### Admin Flow:
1. Admin approves a withdrawal request.
2. System calls `createTransferRecipient` using the customer's `momoNumber` and `momoProvider`.
3. System calls `initiateTransfer` to send funds via Paystack.

## 4. Testing

Use Paystack's test cards and mobile money numbers in the sandbox environment to verify:
- [ ] Deposit completion and balance update.
- [ ] Withdrawal approval and transfer initiation.
- [ ] Webhook signature rejection on invalid attempts.
