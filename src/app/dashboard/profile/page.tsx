'use client';

import { motion } from 'framer-motion';
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
            <CardDescription>Datos de sesión y compañía</CardDescription>
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
