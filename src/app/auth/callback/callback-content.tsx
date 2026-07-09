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
        const hash = window.location.hash;
        let sessionResult;

        if (code) {
          sessionResult = await supabase.auth.exchangeCodeForSession(code);
        } else if (hash) {
          sessionResult = await supabase.auth.getSessionFromUrl();
        }

        if (sessionResult?.error) {
          const errorMessage = sessionResult.error.message || 'Error al procesar la autenticación.';
          setMessage(`Error: ${errorMessage}`);
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

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
