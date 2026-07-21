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
    let sessionCheckTimeout: NodeJS.Timeout;

    const redirectToLogin = () => {
      if (!active) return;
      if (pathname?.startsWith('/dashboard')) {
        router.replace('/auth/login');
      }
      setReady(true);
    };

    const verifySession = async () => {
      if (!pathname?.startsWith('/dashboard')) {
        setReady(true);
        return;
      }

      // Small delay to ensure session is properly loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('AuthGuard verifySession pathname:', pathname, 'session:', session);

      if (!active) return;

      if (session) {
        setReady(true);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (user && !error) {
        setReady(true);
        return;
      }

      redirectToLogin();
      return;
    };

    verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthGuard auth event:', event, 'session:', session);
      if (!active) return;

      if (!pathname?.startsWith('/dashboard')) {
        setReady(true);
        return;
      }

      if (event === 'SIGNED_IN' || session) {
        setReady(true);
        return;
      }

      if (event === 'SIGNED_OUT') {
        redirectToLogin();
        return;
      }
      
      if (!session) {
        redirectToLogin();
      }
    });

    return () => {
      active = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (pathname?.startsWith('/dashboard') && !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}
