"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/publications', label: 'Publications' },
  { href: '/chatbot', label: 'Chatbot' },
  { href: '/graphs', label: 'Graphs' },
  { href: '/quizzes', label: 'Quizzes' },
];

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800/60 bg-space-deep/60 backdrop-blur">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-space-neon">
          🚀 Space Bio KE
        </Link>
        <nav className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md hover:bg-slate-800/50 ${
                pathname === item.href ? 'bg-slate-800/60 text-white' : 'text-slate-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <>
              <span className="text-sm text-slate-300">
                {session?.user?.name ?? 'User'} {session?.user && (session.user as any).role ? `(${(session.user as any).role})` : ''}
              </span>
              <button className="btn" onClick={() => signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => signIn('credentials', { name: 'Guest User', callbackUrl: '/' })}>
                Continue as Guest
              </button>
              <button className="btn" onClick={() => signIn('google')}>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
