'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { completeRegistration } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import { SpecializationModal } from '@/components/modals/specialization-modal';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectingToLogin, setRedirectingToLogin] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [isSavingSpecialization, setIsSavingSpecialization] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setFeedback(null);

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up with metadata and email confirmation redirect
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName || null,
            last_name: lastName || null,
          },
        },
      });

      if (signUpError) {
        const message = /already registered/i.test(signUpError.message)
          ? 'Este correo ya está registrado. Por favor inicia sesión o restablece tu contraseña.'
          : signUpError.message;

        setErrorMessage(message);
        setIsLoading(false);
        return;
      }

      // Get the auth user ID
      const authUserId = signUpData?.user?.id;
      if (!authUserId) {
        setErrorMessage('Error: No se pudo obtener el ID de usuario');
        setIsLoading(false);
        return;
      }

      // 2. Complete registration by creating company, user, roles, etc.
      const registrationResult = await completeRegistration(authUserId, email, firstName, lastName);

      if (!registrationResult.success) {
        setErrorMessage(`Cuenta creada pero hubo un error al completar el registro: ${registrationResult.message}`);
        setIsLoading(false);
        return;
      }

      // 3. Show specialization modal
      setShowSpecializationModal(true);
      setIsLoading(false);
      setFeedback('¡Cuenta creada! Ahora cuéntanos más sobre tu negocio...');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
    }
  };

  const handleSpecializationSelect = async (specialization: string) => {
    setIsSavingSpecialization(true);

    try {
      // Guardar especialización en user_metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          specialization,
        },
      });

      if (error) {
        throw error;
      }

      setShowSpecializationModal(false);
      setFeedback('¡Listo! Redirigiendo al dashboard...');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error guardando especialización');
      setIsSavingSpecialization(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 18%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 25%)',
        }}
      />
      <Card className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-2 px-8 pt-8">
          <CardTitle className="text-3xl text-white">Crear cuenta</CardTitle>
          <CardDescription className="text-slate-300">
            Regístrate para gestionar tu negocio con Business Intelligence y automatizaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nombre</label>
              <Input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Apellido</label>
              <Input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Tu apellido"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Correo electrónico</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Confirmar contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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

            {feedback && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                {feedback}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>

      <SpecializationModal
        isOpen={showSpecializationModal}
        onClose={() => setShowSpecializationModal(false)}
        onSelect={handleSpecializationSelect}
        isLoading={isSavingSpecialization}
      />
    </main>
  );
}
