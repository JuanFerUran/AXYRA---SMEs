'use client';

import { motion } from 'framer-motion';
import { Crown, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, companyId, signOut, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-6 md:p-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi perfil</h1>
          <p className="mt-2 text-muted-foreground">Revisa tus datos y ajusta tu cuenta.</p>
        </div>

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="px-6 py-5">
            <CardTitle>Información de usuario</CardTitle>
            <CardDescription>Datos de sesión, compañía y estado de acceso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <Input value={user?.email ?? ''} readOnly />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">User ID</label>
                <Input value={user?.id ?? ''} readOnly />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
                <Input value={companyId ?? ''} readOnly />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Provider</label>
                <Input value={user?.app_metadata?.provider ?? 'email'} readOnly />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-2 text-cyan-700">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-semibold">Plan</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">Tu cuenta tiene acceso a la experiencia premium de AXYRA.</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold">Seguridad</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">Tus sesiones y permisos se gestionan de forma centralizada.</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
                <div className="flex items-center gap-2 text-fuchsia-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">Experiencia</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">El siguiente paso es convertir tus datos en acciones concretas.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={signOut}>
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
