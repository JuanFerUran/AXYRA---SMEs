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
        // Check if we have tokens in the URL
        const code = searchParams.get('code');
        
        if (code) {
          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(`Error: ${error.message}`);
            setTimeout(() => router.push('/auth/login'), 3000);
            return;
          }
        }

        // Check if user is now logged in
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          setMessage('No se pudo establecer la sesión. Intenta de nuevo.');
          setTimeout(() => router.push('/auth/login'), 3000);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setMessage('Error durante la autenticación.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="text-center">
        <div className="mb-4 inline-block animate-spin rounded-full border-4 border-slate-200 border-t-primary h-12 w-12"></div>
        <p className="text-slate-600">{message}</p>
      </div>
    </main>
  );
}
