'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { updateLoginTimestamp } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session) {
        router.replace('/dashboard');
      }
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const emailValue = String(formData.get('email') || '').trim();
    const passwordValue = String(formData.get('password') || '');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: passwordValue,
      });

      if (error) {
        setErrorMessage(error.message || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        const authUserId = data.session.user.id;

        void updateLoginTimestamp(authUserId).catch(() => {
          // Error silencioso
        });

        const { data: refreshedSessionData } = await supabase.auth.getSession();
        if (refreshedSessionData.session) {
          setIsLoading(false);
          router.replace('/dashboard');
          return;
        }
        setIsLoading(false);
        window.location.assign('/dashboard');
      } else {
        setErrorMessage('No se pudo iniciar sesión. Intenta de nuevo.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 20%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 25%)',
        }}
      />
      <Card className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="text-3xl text-white">Iniciar sesión</CardTitle>
          <CardDescription className="text-slate-300">
            Accede con tu correo y contraseña para ingresar a BIA Platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Correo electrónico</label>
              <Input
                name="email"
                type="email"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Contraseña</label>
              <Input
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">
                <AlertTriangle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/auth/register" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
