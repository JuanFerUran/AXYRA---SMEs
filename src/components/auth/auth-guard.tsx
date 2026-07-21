'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let hasSession = false;

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        hasSession = true;
        if (active) setReady(true);
      }
    };

    // Check if we already have a session stored
    checkInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthGuard onAuthStateChange:', event);
        
        if (!active) return;

        if (session) {
          hasSession = true;
          setReady(true);
          return;
        }

        // Only redirect if we're going to a protected page and lost session
        if (event === 'SIGNED_OUT') {
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/dashboard')) {
            router.replace('/auth/login');
          }
        }
      }
    );

    // Set ready for non-dashboard pages after a short delay to let auth initialize
    const timeout = setTimeout(() => {
      if (active && !hasSession) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/dashboard')) {
          setReady(true);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - run once on mount

  if (!ready) {
    return null; // Return nothing while checking auth, don't show loading state
  }

  return <>{children}</>;
}
