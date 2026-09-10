import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-08-26.dahlia' });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: 'placeholder', // The actual customer ID should come from the user's subscription
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Stripe billing portal]', err);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
