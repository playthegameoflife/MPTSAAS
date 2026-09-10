import { NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { PlanKey } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { plan } = (await request.json()) as { plan: PlanKey };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Free plan does not need checkout' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FacelessVideo.ai — ${planConfig.name}`,
              description:
                plan === 'pro'
                  ? '20 AI-generated videos per month'
                  : 'Unlimited AI-generated videos per month',
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
