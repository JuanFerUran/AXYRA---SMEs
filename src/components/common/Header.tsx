'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, ArrowRight } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/clients', label: 'Clientes' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-fuchsia-500 font-semibold text-white shadow-lg shadow-cyan-500/20">
            B
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              BIA
            </p>
            <p className="text-lg font-semibold text-white">Platform</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/' ? pathname === item.href : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
        >
          Entrar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
