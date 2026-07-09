'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const hash = typeof window !== 'undefined' ? window.location.hash : '';

        // If we have an OAuth code, exchange it
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(`Error: ${error.message}`);
            setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }
        } else if (hash) {
          // Parse tokens returned in the hash and set session
          const params = new URLSearchParams(hash.replace('#', '?'));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token) {
            const payload: any = { access_token };
            if (refresh_token) payload.refresh_token = refresh_token;
            const { error } = await supabase.auth.setSession(payload);

            if (error) {
              setMessage(`Error: ${error.message}`);
              setTimeout(() => router.push('/auth/login'), 3000);
              return;
            }
          }
        }

        // Verify session and redirect
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          setTimeout(() => router.push('/dashboard'), 1000);
          return;
        }

        setMessage('No se pudo establecer la sesión. Te redirigiremos al login.');
        setTimeout(() => router.push('/auth/login'), 3000);
      } catch (err) {
        console.error('Callback error:', err);
        setMessage('Error durante la autenticación. Te redirigiremos al login.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 18%), radial-gradient(circle at bottom right, rgba(168,85,247,0.14), transparent 26%)',
        }}
      />
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/95 px-10 py-16 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="mb-6 inline-block animate-spin rounded-full border-4 border-slate-700 border-t-cyan-300 h-14 w-14"></div>
        <p className="max-w-md text-base text-slate-300">{message}</p>
      </div>
    </main>
  );
}
