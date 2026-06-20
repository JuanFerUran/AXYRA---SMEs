'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/dashboard');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      console.log('Intentando login con:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Respuesta login:', { data, error });

      if (error) {
        console.error('Error de login:', error);
        setErrorMessage(error.message || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        console.log('Sesión exitosa, redirigiendo...');
        router.push('/dashboard');
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="text-3xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Accede con tu correo y contraseña para ingresar a BIA Platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
