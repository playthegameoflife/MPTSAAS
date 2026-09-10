// PLANS config — imported by pricing page
export const PLANS = {
  free: null,
  pro: {
    name: 'Pro',
    price: 3000,
    priceId: process.env.STRIPE_PRICE_PRO ?? 'price_pro_placeholder',
    credits: -1,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
