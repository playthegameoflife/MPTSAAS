import Link from 'next/link';

export const metadata = { title: 'My Videos — FacelessVideo.ai' };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            <span className="text-[#EC4899]">Faceless</span>Video.ai
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/my-videos" className="text-white/60 hover:text-white transition-colors">My Videos</Link>
            <Link href="/account" className="text-white/60 hover:text-white transition-colors">Account</Link>
          </nav>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}
