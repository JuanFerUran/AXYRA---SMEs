'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClients } from '@/features/clients/hooks/useClients';
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

export function ClientForm({ companyId }: { companyId: string }) {
  const { createClient } = useClients({ autoFetch: false });
  const [client, setClient] = useState<CreateClientInput>({
    ...defaultClientData,
    company_id: companyId,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await createClient(client);
      setMessage('Cliente creado correctamente.');
      setClient({
        ...defaultClientData,
        company_id: companyId,
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 py-5">
        <CardTitle>Nuevo cliente</CardTitle>
        <CardDescription>Agrega clientes reales a tu base de datos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
              <Input
                value={client.first_name}
                onChange={(event) => setClient({ ...client, first_name: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Apellido</label>
              <Input
                value={client.last_name}
                onChange={(event) => setClient({ ...client, last_name: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Correo</label>
              <Input
                type="email"
                value={client.email ?? ''}
                onChange={(event) => setClient({ ...client, email: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
              <Input
                type="tel"
                value={client.phone ?? ''}
                onChange={(event) => setClient({ ...client, phone: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
              <Input
                value={client.client_status_id}
                onChange={(event) => setClient({ ...client, client_status_id: event.target.value })}
                placeholder="Active"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Valor de vida</label>
              <Input
                type="number"
                value={client.lifetime_value}
                onChange={(event) => setClient({ ...client, lifetime_value: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear cliente'}
            </Button>
            {message && <span className="text-sm text-emerald-600">{message}</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
