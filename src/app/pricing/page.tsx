import Link from 'next/link';

export const metadata = {
  title: 'Pricing — FacelessVideo.ai',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-[#EC4899]">Faceless</span>Video.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-[#EC4899] hover:bg-[#DB2777] text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[#2563EB] text-sm font-medium uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">One plan.<br />Unlimited videos.</h1>
          <p className="text-white/50 mb-16">Start with 3 free. No credit card required.</p>

          {/* Single plan */}
          <div className="p-8 sm:p-10 rounded-2xl border border-[#EC4899]/30 bg-gradient-to-b from-[#EC4899]/10 to-transparent shadow-2xl shadow-[#EC4899]/10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#EC4899]/20 bg-[#EC4899]/5 text-xs text-[#EC4899]">
              Best value
            </div>

            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-white/40 line-through text-xl font-medium">$45</span>
              <span className="text-5xl font-bold">$30<span className="text-lg font-normal text-white/60">/mo</span></span>
            </div>
            <div className="text-[#EC4899] text-sm font-medium mb-8">Unlimited videos per month</div>

            <ul className="text-left space-y-3 mb-8">
              {[
                'Unlimited AI-generated videos',
                'AI script writing',
                'Stock footage included',
                'Natural voiceover',
                'Auto captions & subtitles',
                'Background music',
                'Multi-platform posting (TikTok, YouTube, Facebook)',
                'Brand kit customization',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                  <svg className="w-4 h-4 text-[#EC4899] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className="block w-full py-4 rounded-xl font-semibold bg-[#EC4899] hover:bg-[#DB2777] text-white transition-colors duration-200 cursor-pointer mb-4"
            >
              Start free — 3 included
            </Link>
            <p className="text-white/30 text-xs">Cancel anytime · No contracts · Secure via Stripe</p>
          </div>

          {/* Free tier callout */}
          <div className="mt-6 p-6 rounded-xl border border-white/10 bg-white/3">
            <p className="text-white/40 text-sm mb-1">Just trying?</p>
            <p className="text-white/60 text-sm">Start free with 3 videos — no card needed.</p>
            <Link href="/dashboard" className="inline-block mt-3 text-sm text-[#EC4899] hover:text-[#DB2777] transition-colors duration-200 cursor-pointer">
              Go to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
