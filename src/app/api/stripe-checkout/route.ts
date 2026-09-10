import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const PLANS = {
  pro: {
    name: 'Pro',
    price: 3000,
    priceId: process.env.STRIPE_PRICE_PRO ?? 'price_pro_placeholder',
  },
} as const;

export async function POST(request: Request) {
  try {
    const { plan } = (await request.json()) as { plan: keyof typeof PLANS };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-08-26.dahlia' });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FacelessVideo.ai — ${planConfig.name}`,
              description: 'Unlimited AI-generated videos per month',
            },
            unit_amount: planConfig.price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Stripe checkout]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
