'use client';

import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { PLANS } from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export default function PricingPage() {
  async function handleCheckout() {
    const stripe = await stripePromise;
    const res = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? 'Checkout failed');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-800">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Faceless</span>Video.ai
        </Link>
        <Link href="/dashboard" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg text-sm">
          Start Free
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">One plan. Everything you need.</h1>
          <p className="text-slate-400 text-lg">Start with 3 free videos. No credit card required.</p>
        </div>

        {/* Single plan card */}
        <div className="p-6 sm:p-8 rounded-2xl border bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 text-center">
          <div className="text-sm font-medium text-slate-400 mb-4">Pro</div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-slate-500 line-through text-2xl font-medium">$45</div>
            <div className="text-5xl font-bold">$30<span className="text-xl font-normal text-slate-400">/mo</span></div>
          </div>
          <div className="text-emerald-400 text-sm mb-6">Unlimited videos per month</div>
          <p className="text-slate-400 text-sm mb-8">Full access to all features. Post every day without limits.</p>
          <button
            onClick={handleCheckout}
            className="w-full py-3 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all"
          >
            Subscribe — $30/mo
          </button>
          <p className="text-center text-slate-500 text-sm mt-6">Secure payments via Stripe · Cancel anytime</p>
        </div>

        {/* Free tier callout */}
        <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/30 text-center">
          <p className="text-slate-300 font-medium mb-1">Just trying?</p>
          <p className="text-slate-400 text-sm">Start free with 3 videos — no card needed.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-sm text-emerald-400 hover:text-emerald-300">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
