// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

export const PLANS = {
  free: null,
  pro: {
    name: 'Pro',
    price: 1900,
    priceId: process.env.STRIPE_PRICE_PRO ?? 'price_pro_placeholder',
    credits: 20,
  },
  unlimited: {
    name: 'Unlimited',
    price: 4900,
    priceId: process.env.STRIPE_PRICE_UNLIMITED ?? 'price_unlimited_placeholder',
    credits: -1,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
