import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-800">
        <div className="text-lg sm:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Faceless</span>Video.ai
        </div>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/dashboard" className="text-white font-medium hover:text-emerald-400 transition">
            Start Free →
          </Link>
        </div>
        {/* Mobile CTA */}
        <Link
          href="/dashboard"
          className="sm:hidden px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg text-sm"
        >
          Start Free
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-32 text-center">
        <div className="inline-block px-3 py-1 mb-6 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full border border-emerald-400/20">
          3 free videos per month · No credit card required
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
          Post 3 videos a day<br />
          <span className="text-emerald-400">without showing your face</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Topic → video → posted to TikTok, YouTube, and Facebook in under 60 seconds.
          No video editing skills needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Generate my first video free
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 border border-slate-700 hover:border-slate-500 rounded-xl transition-all"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16">From topic to posted in 60 seconds</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Enter a topic',
              desc: 'Type any topic or keyword. Our AI writes the script, finds footage, and generates the voiceover.',
            },
            {
              step: '2',
              title: 'Preview & approve',
              desc: 'Watch the generated video. Re-generate or approve. Add your brand kit for consistency.',
            },
            {
              step: '3',
              title: 'Auto-post everywhere',
              desc: 'One click posts to TikTok, YouTube Shorts, and Facebook Reels simultaneously via Postiz.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold mb-4">
                {step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16">Everything you need to go viral</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'AI-generated scripts', desc: 'LLM writes engaging hooks and narration for your niche' },
            { title: 'Stock footage curation', desc: 'Pixabay commercial license — use anywhere, no copyright claims' },
            { title: 'Natural voiceover', desc: 'ElevenLabs-quality TTS with 20+ voices across languages' },
            { title: 'Auto captions', desc: 'Burned-in subtitles so viewers watch without sound' },
            { title: 'Background music', desc: 'Royalty-free tracks matched to your video mood' },
            { title: 'Multi-platform posting', desc: 'TikTok, YouTube Shorts, Facebook Reels — all at once via Postiz' },
            { title: 'Niche templates', desc: 'Pre-built for finance, fitness, tech, crypto, motivation, lifestyle' },
            { title: 'Brand kit', desc: 'Logo intro/outro, color overlays, consistent channel identity' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-slate-900/30 border border-slate-800 rounded-xl">
              <div className="text-emerald-400 mt-0.5">✓</div>
              <div>
                <div className="font-medium mb-0.5">{title}</div>
                <div className="text-slate-400 text-sm">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-slate-400 text-center mb-12 sm:mb-16">Start free. Upgrade when you're ready to scale.</p>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              videos: '3 videos/month',
              desc: 'Try it out. No credit card.',
              cta: 'Start free',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$19',
              videos: '20 videos/month',
              desc: 'For creators building a consistent posting schedule.',
              cta: 'Get Pro',
              highlight: true,
            },
            {
              name: 'Unlimited',
              price: '$49',
              videos: 'Unlimited videos/month',
              desc: 'For agencies and creators posting daily across multiple channels.',
              cta: 'Go unlimited',
              highlight: false,
            },
          ].map(({ name, price, videos, desc, cta, highlight }) => (
            <div
              key={name}
              className={`p-4 sm:p-6 lg:p-8 rounded-2xl border ${
                highlight
                  ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="text-sm font-medium text-slate-400 mb-2">{name}</div>
              <div className="text-3xl sm:text-4xl font-bold mb-1">{price}<span className="text-lg font-normal text-slate-400">/mo</span></div>
              <div className="text-emerald-400 text-sm mb-4">{videos}</div>
              <p className="text-slate-400 text-sm mb-6 sm:mb-8">{desc}</p>
              <button
                className={`w-full py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                  highlight
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 FacelessVideo.ai · Built on MoneyPrinterTurbo</p>
      </footer>
    </div>
  );
}
