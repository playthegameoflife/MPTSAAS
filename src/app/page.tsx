import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-[#EC4899]">Faceless</span>Video.ai
          </Link>
          <div className="flex items-center gap-8">
            <a href="#features" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors duration-200">Features</a>
            <a href="#pricing" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors duration-200">Pricing</a>
            <Link href="/dashboard" className="px-4 py-2 bg-[#EC4899] hover:bg-[#DB2777] text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#EC4899]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/5 text-xs text-white/70">
            <span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full animate-pulse" />
            3 free videos per month · No credit card required
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Post videos daily<br />
            <span className="bg-gradient-to-r from-[#EC4899] to-[#2563EB] bg-clip-text text-transparent">without showing your face</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI writes the script, finds footage, and generates the voiceover.
            Your TikTok, YouTube, and Facebook content — fully automated.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-[#EC4899] hover:bg-[#DB2777] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#EC4899]/25 cursor-pointer text-center"
            >
              Generate my first video free →
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 text-white/80 hover:text-white cursor-pointer text-center"
            >
              See how it works
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              60-second generation
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Commercial license
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <svg className="w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Auto-post everywhere
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#EC4899] text-sm font-medium uppercase tracking-widest text-center mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">From topic to posted in 60 seconds</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                ),
                step: '01',
                title: 'Enter a topic',
                desc: 'Type any keyword or niche. Our AI researches, writes the script, and finds matching stock footage automatically.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
                step: '02',
                title: 'Preview & approve',
                desc: 'Watch the generated video. Re-generate or approve. Add your brand kit for consistent channel identity.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                ),
                step: '03',
                title: 'Auto-post everywhere',
                desc: 'One click posts to TikTok, YouTube Shorts, and Facebook Reels simultaneously via Postiz.',
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-[#EC4899]/30 transition-colors duration-300 group">
                <div className="text-[#EC4899]/40 text-xs font-mono mb-4">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center mb-5 group-hover:bg-[#EC4899]/20 transition-colors duration-300">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#2563EB] text-sm font-medium uppercase tracking-widest text-center mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Everything you need to go viral</h2>

          <div className="grid sm:grid-cols-2 gap-4">
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
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/3 hover:border-[#2563EB]/30 transition-colors duration-200">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <div className="font-medium mb-1 text-sm">{title}</div>
                  <div className="text-white/45 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[#EC4899] text-sm font-medium uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">One plan. Unlimited videos.</h2>
          <p className="text-white/50 mb-12">Start with 3 free. Upgrade when you&apos;re ready to post daily.</p>

          <div className="p-8 sm:p-10 rounded-2xl border border-[#EC4899]/30 bg-gradient-to-b from-[#EC4899]/10 to-transparent shadow-2xl shadow-[#EC4899]/10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-white/40 line-through text-xl font-medium">$45</span>
              <span className="text-5xl font-bold">$30<span className="text-lg font-normal text-white/60">/mo</span></span>
            </div>
            <div className="text-[#EC4899] text-sm font-medium mb-6">Unlimited videos per month</div>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">Full access to all features. Post every day without limits. Cancel anytime.</p>
            <Link
              href="/dashboard"
              className="block w-full py-4 rounded-xl font-semibold bg-[#EC4899] hover:bg-[#DB2777] text-white transition-colors duration-200 cursor-pointer"
            >
              Start free — 3 included
            </Link>
            <p className="text-white/30 text-xs mt-4">Cancel anytime · No contracts · Secure via Stripe</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <p className="text-white/30 text-sm">© 2026 FacelessVideo.ai · Built on MoneyPrinterTurbo</p>
      </footer>
    </div>
  );
}
