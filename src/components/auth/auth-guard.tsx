'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const isProtectedRoute = pathname?.startsWith('/dashboard') ?? false;
    const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/auth/callback';

    const finalize = (session: typeof supabase.auth.getSession extends () => Promise<infer T> ? T extends { data: { session: infer S } } ? S : never : never) => {
      if (!active) return;

      if (session) {
        setReady(true);
        return;
      }

      if (isProtectedRoute) {
        router.replace('/auth/login');
        return;
      }

      setReady(true);
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      finalize(session);
    };

    void checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT' && isProtectedRoute) {
        router.replace('/auth/login');
        return;
      }

      if (session) {
        setReady(true);
        return;
      }

      if (!isAuthRoute) {
        setReady(true);
      }
    });

    const timeout = window.setTimeout(() => {
      if (!active) return;
      if (!isProtectedRoute && !isAuthRoute) {
        setReady(true);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
