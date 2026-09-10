'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { onAuthStateChanged, auth, signInWithGoogle, signOutUser, type User } from '@/lib/firebase';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <svg className="animate-spin w-6 h-6 text-[#EC4899]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
      </svg>
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => { setUser(u); setAuthLoading(false); },
      () => { setAuthError(true); setAuthLoading(false); }
    );
    timeout = setTimeout(() => setAuthLoading(false), 5000);
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe-billing', { method: 'POST' });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? 'Failed to open billing portal');
    } catch {
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><Spinner /></div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
        <p className="text-white/40 mb-8">Access your subscription and settings.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-8">Account</h1>

      {/* Profile */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50 mb-5">
        <div className="flex items-center gap-4">
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? ''} className="w-14 h-14 rounded-full" />
          )}
          <div>
            <div className="font-semibold text-white">{user.displayName}</div>
            <div className="text-sm text-white/40">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-white/80 mb-1">Subscription</div>
            <div className="text-xs text-white/30">Manage your plan and billing</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20">
            Free Tier
          </div>
          <span className="text-sm text-white/40">2 videos/month</span>
        </div>
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-medium bg-[#EC4899] hover:bg-[#DB2777] disabled:opacity-50 text-white text-sm transition-colors cursor-pointer"
        >
          {loading ? 'Loading...' : 'Upgrade to Pro — $30/mo'}
        </button>
        <p className="text-center text-white/25 text-xs mt-3">30 videos/month · No watermark · Priority rendering</p>
      </div>

      {/* Account actions */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#1E293B]/50">
        <div className="text-sm font-medium text-white/80 mb-4">Account Actions</div>
        <button
          onClick={signOutUser}
          className="w-full py-2.5 rounded-lg font-medium border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 text-sm transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
