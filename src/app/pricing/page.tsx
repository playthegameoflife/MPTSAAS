import Link from 'next/link';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Pricing — MPT SaaS',
};

const FEATURES = [
  'Unlimited AI-generated videos',
  'AI script writing',
  'Stock footage (Pixabay)',
  'Natural TTS voiceover',
  'Auto captions & subtitles',
  'Background music',
  'Multi-platform posting (TikTok, YouTube, Facebook)',
  'Brand kit customization',
];

export default function PricingPage() {
  return (
    <AppShell publicOnly>
      <div style={{ minHeight: 'calc(100vh - var(--topbar-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

          {/* Header */}
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Pricing</p>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>
            One plan. Unlimited videos.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fg-secondary)', marginBottom: 48 }}>
            Start with 3 free. No credit card required.
          </p>

          {/* Card */}
          <div style={{
            padding: 36,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'left',
          }}>
            {/* Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: 12, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                Best value
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.02em' }}>$30</span>
                <span style={{ fontSize: 16, color: 'var(--fg-tertiary)' }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-tertiary)', marginTop: 4 }}>Unlimited videos per month</div>
            </div>

            {/* CTA */}
            <div style={{ marginBottom: 28 }}>
              <Link
                href="/dashboard"
                style={{ display: 'block', width: '100%', padding: '13px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 500, transition: 'background var(--transition-fast)', textAlign: 'center' }}
              >
                Start free — 3 included
              </Link>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 12 }}>
                Cancel anytime · No contracts · Secure via Stripe
              </p>
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-secondary)' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Free tier */}
          <div style={{ marginTop: 16, padding: 24, background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)', marginBottom: 4 }}>Just trying?</p>
            <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 16 }}>
              Start free with 3 videos — no credit card needed.
            </p>
            <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, transition: 'opacity var(--transition-fast)' }}>
              Go to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
