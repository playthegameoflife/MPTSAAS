import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function HomePage() {
  return (
    <AppShell publicOnly>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        {/* Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 'var(--topbar-height)',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, color: 'var(--fg-primary)' }}>
              <LogoMark />
              <span>MPT</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="#features" style={{ fontSize: 13, color: 'var(--fg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}>Features</Link>
              <Link href="/pricing" style={{ fontSize: 13, color: 'var(--fg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}>Pricing</Link>
              <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', transition: 'background var(--transition-fast)' }}>
                Start free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ paddingTop: 'calc(var(--topbar-height) + 80px)', paddingBottom: 100, paddingLeft: 24, paddingRight: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              3 free videos per month · No credit card required
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--fg-primary)' }}>
              Post videos daily<br />
              <span style={{ color: 'var(--accent)' }}>without showing your face</span>
            </h1>

            <p style={{ fontSize: 18, color: 'var(--fg-secondary)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
              AI writes the script, finds footage, and generates the voiceover.
              Your TikTok, YouTube, and Facebook content — fully automated.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/dashboard"
                style={{ padding: '12px 28px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 500, transition: 'background var(--transition-fast)', boxShadow: '0 2px 8px rgba(162,89,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Generate my first video free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                href="#how-it-works"
                style={{ padding: '12px 28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', color: 'var(--fg-secondary)', fontSize: 15, fontWeight: 500, transition: 'all var(--transition-fast)', background: 'var(--bg-card)' }}
              >
                See how it works
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
              {[
                { icon: '⚡', text: '60-second generation' },
                { icon: '🔒', text: 'Commercial license' },
                { icon: '📲', text: 'Auto-post everywhere' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-tertiary)' }}>
                  <span>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>How it works</p>
            <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 56, color: 'var(--fg-primary)' }}>
              From topic to posted in 60 seconds
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {[
                {
                  step: '01',
                  title: 'Enter a topic',
                  desc: 'Type any keyword or niche. Our AI researches, writes the script, and finds matching stock footage automatically.',
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3H7C5.9 3 5 3.9 5 5V15C5 16.1 5.9 17 7 17H13C14.1 17 15 16.1 15 15V5C15 3.9 14.1 3 13 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8H13M7 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                },
                {
                  step: '02',
                  title: 'Preview & approve',
                  desc: 'Watch the generated video. Re-generate or approve. Add your brand kit for consistent channel identity.',
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                },
                {
                  step: '03',
                  title: 'Auto-post everywhere',
                  desc: 'One click posts to TikTok, YouTube Shorts, and Facebook Reels simultaneously via Postiz.',
                  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="15" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="5" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 11.5L12.5 8.5M7.5 8.5L12.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                },
              ].map(({ step, title, desc, icon }) => (
                <div key={step} style={{ padding: 28, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-tertiary)', marginBottom: 16 }}>{step}</div>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--fg-primary)' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ padding: '80px 24px', background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Features</p>
            <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 56, color: 'var(--fg-primary)' }}>
              Everything you need to go viral
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { icon: '📝', title: 'AI-generated scripts', desc: 'LLM writes engaging hooks and narration for your niche' },
                { icon: '🎬', title: 'Stock footage', desc: 'Pixabay commercial license — use anywhere, no copyright claims' },
                { icon: '🎙️', title: 'Natural voiceover', desc: 'Gemini-powered TTS with natural, humanlike voiceover' },
                { icon: '💬', title: 'Auto captions', desc: 'Burned-in subtitles so viewers watch without sound' },
                { icon: '🎵', title: 'Background music', desc: 'Royalty-free tracks matched to your video mood' },
                { icon: '📲', title: 'Multi-platform posting', desc: 'TikTok, YouTube Shorts, Facebook Reels — all at once' },
                { icon: '🏷️', title: 'Niche templates', desc: 'Pre-built for finance, fitness, tech, crypto, motivation' },
                { icon: '🎨', title: 'Brand kit', desc: 'Logo intro/outro, color overlays, consistent identity' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
                  <span style={{ fontSize: 22, lineHeight: 1.2 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12, color: 'var(--fg-primary)' }}>One plan. Unlimited videos.</h2>
            <p style={{ fontSize: 15, color: 'var(--fg-secondary)', marginBottom: 32 }}>Start with 3 free. Upgrade when you&apos;re ready to post daily.</p>
            <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 600, color: 'var(--fg-primary)' }}>$30</span>
                <span style={{ fontSize: 15, color: 'var(--fg-tertiary)' }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-tertiary)', marginBottom: 24 }}>Unlimited videos per month</p>
              <Link href="/dashboard" style={{ display: 'block', padding: '12px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, transition: 'background var(--transition-fast)' }}>
                Start free — 3 included
              </Link>
              <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 16 }}>Cancel anytime · No contracts · Secure via Stripe</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--fg-tertiary)' }}>© 2026 MPT SaaS · Built on MoneyPrinterTurbo</p>
        </footer>
      </div>
    </AppShell>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="var(--accent)"/>
      <path d="M7 8L12 12L17 8M7 16L12 12L17 16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
