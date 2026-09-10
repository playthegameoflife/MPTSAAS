'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { PLANS } from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: 'pro' | 'unlimited') {
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Checkout failed');
        setLoading(null);
      }
    } catch {
      alert('Network error');
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-800">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Faceless</span>Video.ai
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg text-sm"
        >
          Start Free
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-lg">Start free. Upgrade when you're ready to scale.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Free */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl border bg-slate-900/50 border-slate-800 flex flex-col">
            <div className="text-sm font-medium text-slate-400 mb-2">Free</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">$0</div>
            <div className="text-emerald-400 text-sm mb-4">3 videos/month</div>
            <p className="text-slate-400 text-sm mb-6 flex-1">Try it out. No credit card required.</p>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-center rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-white transition-all text-sm sm:text-base"
            >
              Start free
            </Link>
          </div>

          {/* Pro */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl border bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium text-slate-400">Pro</div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">$19</div>
            <div className="text-emerald-400 text-sm mb-4">20 videos/month</div>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              For creators building a consistent posting schedule.
            </p>
            <button
              onClick={() => handleCheckout('pro')}
              disabled={loading === 'pro'}
              className="w-full py-3 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all text-sm sm:text-base disabled:opacity-60"
            >
              {loading === 'pro' ? 'Redirecting...' : 'Get Pro'}
            </button>
          </div>

          {/* Unlimited */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl border bg-slate-900/50 border-slate-800 flex flex-col">
            <div className="text-sm font-medium text-slate-400 mb-2">Unlimited</div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">$49</div>
            <div className="text-emerald-400 text-sm mb-4">Unlimited videos/month</div>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              For agencies and creators posting daily across multiple channels.
            </p>
            <button
              onClick={() => handleCheckout('unlimited')}
              disabled={loading === 'unlimited'}
              className="w-full py-3 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-white transition-all text-sm sm:text-base disabled:opacity-60"
            >
              {loading === 'unlimited' ? 'Redirecting...' : 'Go unlimited'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-12">
          Secure payments via Stripe · Cancel anytime
        </p>
      </div>
    </div>
  );
}
