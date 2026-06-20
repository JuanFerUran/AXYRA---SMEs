'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useClient } from '@/features/clients/hooks/useClient';
import { useClients } from '@/features/clients/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { UpdateClientInput } from '@/features/clients/types/client';

export default function ClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = typeof params?.id === 'string' ? params.id : null;
  const { client, isLoading, error } = useClient(clientId);
  const { updateClient } = useClients({ autoFetch: false });

  const [formState, setFormState] = useState<UpdateClientInput>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!client) return;

    setFormState({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email ?? undefined,
      phone: client.phone ?? undefined,
      client_status_id: client.client_status_id,
      total_purchases: client.total_purchases,
      lifetime_value: client.lifetime_value,
      country: client.country ?? undefined,
      city: client.city ?? undefined,
      address: client.address ?? undefined,
      is_active: client.is_active,
    });
  }, [client]);

  if (!clientId) return null;

  const handleChange = (field: keyof UpdateClientInput, value: string | number | boolean | null | undefined) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await updateClient(clientId, formState);
      setFeedback('Cliente actualizado correctamente.');
      setTimeout(() => {
        router.push(`/dashboard/clients/${clientId}`);
      }, 700);
    } catch (err: any) {
      setSubmitError(err?.message || 'No se pudo actualizar el cliente.');
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Editar cliente</p>
              <h1 className="mt-2 text-3xl font-bold">Actualiza los datos de tu cliente</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Cambia información de contacto, estado o valores comerciales y mantén el historial sincronizado.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/dashboard/clients/${clientId}`)}>
              Volver al cliente
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Cargando datos del cliente...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            {error.message}
          </div>
        ) : (
          <Card className="rounded-3xl border border-border bg-white shadow-xl">
            <CardHeader className="px-8 py-8">
              <CardTitle className="text-2xl">Formulario de edición</CardTitle>
              <CardDescription>Actualiza los campos que necesites y guarda los cambios.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 px-8 pb-8">
              <form className="grid gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
                    <Input
                      value={formState.first_name || ''}
                      onChange={(event) => handleChange('first_name', event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Apellido</label>
                    <Input
                      value={formState.last_name || ''}
                      onChange={(event) => handleChange('last_name', event.target.value)}
                      required
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
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                    <Input
                      type="tel"
                      value={formState.phone ?? ''}
                      onChange={(event) => handleChange('phone', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
                    <Input
                      value={formState.client_status_id || ''}
                      onChange={(event) => handleChange('client_status_id', event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Lifetime value</label>
                    <Input
                      type="number"
                      value={formState.lifetime_value ?? 0}
                      onChange={(event) => handleChange('lifetime_value', Number(event.target.value))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Ciudad</label>
                    <Input
                      value={formState.city ?? ''}
                      onChange={(event) => handleChange('city', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">País</label>
                    <Input
                      value={formState.country ?? ''}
                      onChange={(event) => handleChange('country', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Dirección</label>
                    <Input
                      value={formState.address ?? ''}
                      onChange={(event) => handleChange('address', event.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl border border-border bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Activo</p>
                      <p className="text-sm text-muted-foreground">Cambiar estado del cliente</p>
                    </div>
                    <Input
                      type="checkbox"
                      checked={formState.is_active ?? false}
                      onChange={(event) => handleChange('is_active', event.target.checked)}
                      className="h-5 w-5 rounded border-border bg-background"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.main>
  );
}
