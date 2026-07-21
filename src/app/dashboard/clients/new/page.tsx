'use client';

import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useClients } from '@/features/clients/hooks/useClients';
import { useClientStatuses } from '@/features/clients/hooks/useClientStatuses';
import type { CreateClientInput } from '@/features/clients/types/client';

const defaultClientData: CreateClientInput = {
  company_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  client_status_id: '',
  total_purchases: 0,
  lifetime_value: 0,
  is_active: true,
};

export default function NewClientPage() {
  const router = useRouter();
  const { companyId, isLoading: authLoading } = useSupabaseAuth();
  const { statuses, isLoading: statusesLoading } = useClientStatuses();
  const { createClient } = useClients({ autoFetch: false });

  const [formState, setFormState] = useState<CreateClientInput>({
    ...defaultClientData,
    company_id: companyId ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Cargando cliente...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <p className="text-lg font-semibold">No se encontró la empresa asociada.</p>
          <p className="mt-2 text-sm text-muted-foreground">Inicia sesión nuevamente o contacta al administrador.</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof CreateClientInput, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await createClient(formState);
      setFeedback('Cliente creado correctamente.');
      setFormState({ ...defaultClientData, company_id: companyId });
      setTimeout(() => {
        router.push('/dashboard/clients');
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      className="min-h-screen bg-background p-6 md:p-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Nuevo cliente</p>
              <h1 className="mt-2 text-3xl font-bold">Agregar cliente a tu empresa</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Completa los campos para registrar un cliente nuevo en el sistema. Esta información se integrará con tus reportes y automatizaciones.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-linear-to-r from-blue-500 to-cyan-500 px-5 py-4 text-white shadow-lg shadow-blue-500/10">
              <PlusCircle className="h-7 w-7" />
              <span className="text-sm font-semibold">Cliente nuevo</span>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl border border-border bg-white shadow-xl">
          <CardHeader className="px-8 py-8">
            <CardTitle className="text-2xl">Registro rápido</CardTitle>
            <CardDescription>
              Guarda un nuevo cliente con datos mínimos para comenzar con seguimiento inmediato.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 px-8 pb-8">
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
                  <Input
                    value={formState.first_name}
                    onChange={(event) => handleChange('first_name', event.target.value)}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Apellido</label>
                  <Input
                    value={formState.last_name}
                    onChange={(event) => handleChange('last_name', event.target.value)}
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Correo</label>
                  <Input
                    type="email"
                    value={formState.email ?? ''}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="cliente@empresa.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                  <Input
                    type="tel"
                    value={formState.phone ?? ''}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    placeholder="+54 9 11 1234 5678"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
                  <Select
                    value={formState.client_status_id}
                    onChange={(event) => handleChange('client_status_id', event.target.value)}
                    required
                    disabled={statusesLoading}
                  >
                    <option value="">Selecciona un estado</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Valor de vida</label>
                  <Input
                    type="number"
                    value={formState.lifetime_value}
                    onChange={(event) => handleChange('lifetime_value', Number(event.target.value))}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cliente'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.main>
  );
}
