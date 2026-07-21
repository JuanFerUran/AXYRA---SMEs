'use client';

import { useState } from 'react';
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

export function ClientForm({ companyId }: { companyId: string }) {
  const { createClient } = useClients({ autoFetch: false });
  const [client, setClient] = useState<CreateClientInput>({
    ...defaultClientData,
    company_id: companyId,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { statuses, isLoading: statusesLoading } = useClientStatuses();

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
              <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-slate-700">
                Nombre
              </label>
              <Input
                id="first_name"
                value={client.first_name}
                onChange={(event) => setClient({ ...client, first_name: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-slate-700">
                Apellido
              </label>
              <Input
                id="last_name"
                value={client.last_name}
                onChange={(event) => setClient({ ...client, last_name: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Correo
              </label>
              <Input
                id="email"
                type="email"
                value={client.email ?? ''}
                onChange={(event) => setClient({ ...client, email: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <Input
                id="phone"
                type="tel"
                value={client.phone ?? ''}
                onChange={(event) => setClient({ ...client, phone: event.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="client_status_id"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Estado
              </label>
              <Select
                id="client_status_id"
                value={client.client_status_id}
                onChange={(event) => setClient({ ...client, client_status_id: event.target.value })}
                required
                disabled={statusesLoading}
              >
                <option value="">Selecciona un estado</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label
                htmlFor="lifetime_value"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Valor de vida
              </label>
              <Input
                id="lifetime_value"
                type="number"
                value={client.lifetime_value}
                onChange={(event) =>
                  setClient({ ...client, lifetime_value: Number(event.target.value) })
                }
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
