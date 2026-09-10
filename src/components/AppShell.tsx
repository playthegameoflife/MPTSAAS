'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, auth, signInWithGoogle, signOutUser, type User } from '@/lib/firebase';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: '/my-videos',
    label: 'My Videos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 6.5L9.5 8L6 9.5V6.5Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/account',
    label: 'Account',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 13.5C2 11.5 4.5 10.5 8 10.5C11.5 10.5 14 11.5 14 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/pricing',
    label: 'Pricing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L9.8 5.8L14.5 6.3L11.2 9.4L12.1 14L8 11.8L3.9 14L4.8 9.4L1.5 6.3L6.2 5.8L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

interface AppShellProps {
  children: React.ReactNode;
  /** Pages that don't require auth (shown without sidebar) */
  publicOnly?: boolean;
}

export default function AppShell({ children, publicOnly = false }: AppShellProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => { setUser(u); setAuthLoading(false); },
      () => { setAuthLoading(false); }
    );
    timeout = setTimeout(() => setAuthLoading(false), 5000);
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  // Public-only pages (landing, pricing) — show just the page, no shell
  if (publicOnly) {
    if (authLoading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
          <div style={{ color: 'var(--fg-tertiary)', fontSize: 14 }}>Loading...</div>
        </div>
      );
    }
    // For public-only pages, still show a minimal top bar with logo + sign in
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        {/* Minimal public nav */}
        <header style={{ height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogoMark />
              <span>MPT</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!user && (
                <button
                  onClick={() => signInWithGoogle()}
                  style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)', background: 'none', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                >
                  Sign in
                </button>
              )}
              <Link
                href="/dashboard"
                style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', transition: 'background var(--transition-fast)', display: 'inline-flex', alignItems: 'center' }}
              >
                Start free
              </Link>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  // Auth-gated pages — require user
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--fg-tertiary)', fontSize: 14 }}>Connecting...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPrompt onSignIn={() => signInWithGoogle()} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ height: 'var(--topbar-height)', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15, color: 'var(--fg-primary)' }}>
            <LogoMark />
            <span>MPT</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                  background: active ? 'var(--bg-overlay)' : 'none',
                  transition: 'background var(--transition-fast), color var(--transition-fast)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ color: active ? 'var(--accent)' : 'var(--fg-tertiary)', display: 'flex' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName ?? ''} style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>
                {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName ?? 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email ?? ''}
              </div>
            </div>
            <button
              onClick={signOutUser}
              title="Sign out"
              style={{ background: 'none', border: 'none', padding: 4, color: 'var(--fg-tertiary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', display: 'flex', transition: 'color var(--transition-fast)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 2H2.5C2 2 1.5 2.5 1.5 3V11C1.5 11.5 2 12 2.5 12H5.5M9.5 10L12 7M12 7L9.5 4M12 7H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{ height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{ display: 'none', background: 'none', border: 'none', padding: 4, color: 'var(--fg-secondary)', cursor: 'pointer' }}
            className="mobile-menu-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Breadcrumb / page title area */}
          <div style={{ flex: 1 }} />
          {/* Quick action */}
          <Link
            href="/dashboard"
            style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', transition: 'background var(--transition-fast)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New video
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 32px' }}>
          {children}
        </main>
      </div>
    </div>
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

function AuthPrompt({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <LogoMark />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--fg-primary)' }}>
          Sign in to continue
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginBottom: 28 }}>
          Create AI videos — 3 free per month, no credit card required.
        </p>
        <button
          onClick={onSignIn}
          style={{ width: '100%', padding: '11px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--fg-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'box-shadow var(--transition-fast)', boxShadow: 'var(--shadow-sm)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
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
}
