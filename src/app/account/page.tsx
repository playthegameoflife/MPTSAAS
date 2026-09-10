'use client';

import AppShell from '@/components/AppShell';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { onAuthStateChanged, auth, signInWithGoogle, signOutUser, type User } from '@/lib/firebase';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)', ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg-tertiary)', marginBottom: 16, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? 'Failed to start checkout');
    } catch {
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/stripe-billing', { method: 'POST' });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? 'Failed to open billing portal');
    } catch {
      alert('Failed to open billing portal');
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>Account</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>Manage your profile and subscription.</p>
        </div>

        {/* Profile */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Profile</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName ?? ''} style={{ width: 48, height: 48, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>
                {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-primary)' }}>{user?.displayName ?? 'User'}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-tertiary)' }}>{user?.email ?? ''}</div>
            </div>
          </div>
        </Card>

        {/* Subscription */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Subscription</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)', marginBottom: 2 }}>Free Tier</div>
              <div style={{ fontSize: 12, color: 'var(--fg-tertiary)' }}>3 videos per month</div>
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-overlay)', color: 'var(--fg-secondary)', fontSize: 12, fontWeight: 500 }}>
              Free
            </div>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
            {[
              '3 videos per month',
              'AI script writing',
              'Stock footage (Pixabay)',
              'TTS voiceover',
              'Auto subtitles',
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {feature}
              </div>
            ))}
          </div>

          {/* Upgrade */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{ width: '100%', padding: '11px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'opacity var(--transition-fast)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M7 2A5 5 0 0 1 12 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Redirecting...
              </>
            ) : (
              <>Upgrade to Pro — $30/mo →</>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 12 }}>
            Unlimited videos · Priority rendering · No watermark · Cancel anytime
          </p>
        </Card>

        {/* Billing portal */}
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Billing</SectionLabel>
          <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 16 }}>
            Manage your existing subscription, update payment method, or download invoices.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={billingLoading}
            style={{ width: '100%', padding: '10px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', color: 'var(--fg-primary)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)', cursor: billingLoading ? 'not-allowed' : 'pointer', opacity: billingLoading ? 0.6 : 1, transition: 'opacity var(--transition-fast)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {billingLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                  <path d="M7 2A5 5 0 0 1 12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Opening...
              </>
            ) : (
              <>Manage billing →</>
            )}
          </button>
        </Card>

        {/* Sign out */}
        <Card>
          <SectionLabel>Session</SectionLabel>
          <button
            onClick={signOutUser}
            style={{ width: '100%', padding: '10px 20px', borderRadius: 'var(--radius-lg)', background: 'none', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all var(--transition-fast)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 2H2.5C2 2 1.5 2.5 1.5 3V11C1.5 11.5 2 12 2.5 12H5.5M9.5 10L12 7M12 7L9.5 4M12 7H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </Card>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppShell>
  );
}
