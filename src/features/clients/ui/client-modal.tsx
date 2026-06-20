'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type {
  ClientWithRelations,
  CreateClientInput,
  UpdateClientInput,
} from '@/features/clients/types/client';

const defaultFormState: CreateClientInput = {
  company_id: '',
  first_name: '',
  last_name: '',
  email: undefined,
  phone: undefined,
  date_of_birth: null,
  gender: null,
  nationality: null,
  occupation: null,
  preferred_contact: null,
  avatar_url: null,
  client_status_id: '',
  total_purchases: 0,
  lifetime_value: 0,
  last_purchase_date: null,
  average_order_value: null,
  country: null,
  state: null,
  city: null,
  postal_code: null,
  address: null,
  tags: null,
  notes: null,
  is_active: true,
};

function mapClientToFormState(client: ClientWithRelations): CreateClientInput {
  return {
    company_id: client.company_id,
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    date_of_birth: client.date_of_birth ?? null,
    gender: client.gender ?? null,
    nationality: client.nationality ?? null,
    occupation: client.occupation ?? null,
    preferred_contact: client.preferred_contact ?? null,
    avatar_url: client.avatar_url ?? null,
    client_status_id: client.client_status_id,
    total_purchases: client.total_purchases,
    lifetime_value: client.lifetime_value,
    last_purchase_date: client.last_purchase_date ?? null,
    average_order_value: client.average_order_value ?? null,
    country: client.country ?? null,
    state: client.state ?? null,
    city: client.city ?? null,
    postal_code: client.postal_code ?? null,
    address: client.address ?? null,
    tags: client.tags ?? null,
    notes: client.notes ?? null,
    is_active: client.is_active,
  };
}

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  initialClient?: ClientWithRelations | null;
  createClient: (input: CreateClientInput) => Promise<ClientWithRelations>;
  updateClient: (id: string, input: UpdateClientInput) => Promise<ClientWithRelations>;
  onSaveSuccess?: (client: ClientWithRelations) => void;
}

export function ClientModal({
  open,
  onOpenChange,
  companyId,
  initialClient,
  createClient,
  updateClient,
  onSaveSuccess,
}: ClientModalProps) {
  const isEditMode = Boolean(initialClient);
  const [formState, setFormState] = useState<CreateClientInput>({
    ...defaultFormState,
    company_id: companyId,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormState(
        initialClient
          ? mapClientToFormState(initialClient)
          : { ...defaultFormState, company_id: companyId }
      );
      setError(null);
      setFeedback(null);
    }
  }, [open, initialClient, companyId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    setIsSaving(true);

    try {
      if (isEditMode && initialClient) {
        const updated = await updateClient(initialClient.id, {
          first_name: formState.first_name,
          last_name: formState.last_name,
          email: formState.email,
          phone: formState.phone,
          client_status_id: formState.client_status_id,
          lifetime_value: formState.lifetime_value,
          total_purchases: formState.total_purchases,
          is_active: formState.is_active,
        });

        setFeedback('Cliente actualizado correctamente.');
        onSaveSuccess?.(updated);
      } else {
        const created = await createClient({
          ...formState,
          company_id: companyId,
          total_purchases: formState.total_purchases || 0,
          lifetime_value: formState.lifetime_value || 0,
          is_active: formState.is_active ?? true,
        });

        setFeedback('Cliente creado correctamente.');
        onSaveSuccess?.(created);
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ajusta los datos del cliente y guarda los cambios.' : 'Ingresa información clave para crear un cliente nuevo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
              <Input
                value={formState.first_name}
                onChange={(event) => setFormState({ ...formState, first_name: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Apellido</label>
              <Input
                value={formState.last_name}
                onChange={(event) => setFormState({ ...formState, last_name: event.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Correo electrónico</label>
              <Input
                type="email"
                value={formState.email ?? ''}
                onChange={(event) => setFormState({ ...formState, email: event.target.value || undefined })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
              <Input
                type="tel"
                value={formState.phone ?? ''}
                onChange={(event) => setFormState({ ...formState, phone: event.target.value || undefined })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
              <Input
                value={formState.client_status_id}
                onChange={(event) => setFormState({ ...formState, client_status_id: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Valor de vida</label>
              <Input
                type="number"
                value={formState.lifetime_value}
                onChange={(event) => setFormState({ ...formState, lifetime_value: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Compras totales</label>
              <Input
                type="number"
                value={formState.total_purchases}
                onChange={(event) => setFormState({ ...formState, total_purchases: Number(event.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="is_active"
                type="checkbox"
                checked={formState.is_active}
                onChange={(event) => setFormState({ ...formState, is_active: event.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Cliente activo
              </label>
            </div>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {feedback && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</p>}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
