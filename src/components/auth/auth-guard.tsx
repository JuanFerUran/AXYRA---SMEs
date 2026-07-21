'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [isAuthRoute, setIsAuthRoute] = useState(false);

  useEffect(() => {
    let active = true;

    // Check if this is an auth route (login/register)
    const authPaths = ['/auth/login', '/auth/register', '/auth/callback'];
    const isAuthPath = authPaths.some(path => pathname?.startsWith(path));
    
    if (isAuthPath) {
      setIsAuthRoute(true);
      setReady(true);
      return;
    }

    setIsAuthRoute(false);

    // For non-auth routes (dashboard, etc), wait for auth state
    let hasInitialized = false;
    let redirectTimeout: NodeJS.Timeout;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthGuard onAuthStateChange:', event, 'has session:', !!session);
      
      if (!active) return;

      // If we have a session, mark as ready
      if (session) {
        hasInitialized = true;
        setReady(true);
        return;
      }

      // If we're signed out or don't have a session on dashboard routes
      if (!session && pathname?.startsWith('/dashboard')) {
        if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          hasInitialized = true;
          router.replace('/auth/login');
          return;
        }
      }
    });

    // Fallback: if no auth state change after 3 seconds, check session directly
    redirectTimeout = setTimeout(async () => {
      if (!active || hasInitialized) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!active) return;

      if (session) {
        setReady(true);
      } else if (pathname?.startsWith('/dashboard')) {
        router.replace('/auth/login');
      } else {
        setReady(true);
      }
    }, 3000);

    return () => {
      active = false;
      clearTimeout(redirectTimeout);
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // For auth routes, render immediately
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // For other routes, wait for auth verification
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
