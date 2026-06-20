'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useClient } from '@/features/clients/hooks/useClient';
import { useClients } from '@/features/clients/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Phone, MapPin, CalendarDays, ShieldCheck, RefreshCcw, Activity, Sparkles } from 'lucide-react';
import type { UpdateClientInput } from '@/features/clients/types/client';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = typeof params?.id === 'string' ? params.id : null;
  const { client, isLoading, error, fetchClient } = useClient(clientId);
  const { updateClient } = useClients({ autoFetch: false });

  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [quickForm, setQuickForm] = useState<UpdateClientInput>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!client) return;

    setQuickForm({
      email: client.email ?? undefined,
      phone: client.phone ?? undefined,
      city: client.city ?? undefined,
      country: client.country ?? undefined,
      address: client.address ?? undefined,
      client_status_id: client.client_status_id,
      is_active: client.is_active,
    });
  }, [client]);

  const parseDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (value?: string | null) => {
    const date = parseDate(value);
    return date
      ? new Intl.DateTimeFormat('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(date)
      : 'Fecha no disponible';
  };

  const historyEntries = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      rawDate: number;
      type: 'sale' | 'system';
    }> = [];

    if (!client) return items;

    if (client.created_at) {
      const rawDate = parseDate(client.created_at)?.getTime() ?? 0;
      items.push({
        id: 'created',
        title: 'Cliente creado',
        description: 'Registro inicial en el sistema.',
        date: client.created_at,
        rawDate,
        type: 'system',
      });
    }

    if (client.updated_at && client.updated_at !== client.created_at) {
      const rawDate = parseDate(client.updated_at)?.getTime() ?? 0;
      items.push({
        id: 'updated',
        title: 'Perfil actualizado',
        description: 'Últimos cambios guardados en la información del cliente.',
        date: client.updated_at,
        rawDate,
        type: 'system',
      });
    }

    const sales = client.sales ?? [];
    items.push(
      ...sales.map((sale) => {
        const createdAt = sale.created_at || client.created_at || '';
        return {
          id: sale.id,
          title: sale.status ? `Venta ${sale.status}` : 'Venta registrada',
          description: sale.description || `Monto: $${sale.amount ?? '0'}`,
          date: createdAt,
          rawDate: parseDate(createdAt)?.getTime() ?? 0,
          type: 'sale' as const,
        };
      })
    );

    return items.sort((a, b) => b.rawDate - a.rawDate || a.title.localeCompare(b.title));
  }, [client]);

  const timelineByDate = useMemo(() => {
    return historyEntries.reduce<Record<string, typeof historyEntries>>((groups, item) => {
      const dateLabel = formatDate(item.date);
      groups[dateLabel] = groups[dateLabel] ?? [];
      groups[dateLabel].push(item);
      return groups;
    }, {});
  }, [historyEntries]);

  const eventSummary = useMemo(() => ({
    totalEvents: historyEntries.length,
    saleEvents: historyEntries.filter((entry) => entry.type === 'sale').length,
    clientVehicles: client?.vehicles_count ?? 0,
  }), [historyEntries, client]);

  if (!clientId) return null;

  const handleQuickSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await updateClient(clientId, quickForm);
      await fetchClient();
      setFeedback('Cambios guardados correctamente.');
    } catch (err: any) {
      setSubmitError(err?.message || 'No se pudo guardar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      className="min-h-screen bg-background p-6 md:p-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button variant="outline" onClick={() => router.push('/dashboard/clients')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a clientes
            </Button>
          </div>
          <div className="space-y-1 text-right md:text-left">
            <p className="text-sm text-muted-foreground">Detalle de cliente</p>
            <h1 className="text-3xl font-bold">{client?.first_name} {client?.last_name}</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Cargando cliente...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            {error.message}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card className="rounded-3xl border border-border bg-white shadow-xl">
                <CardHeader className="px-8 py-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">Información básica</CardTitle>
                      <CardDescription>Datos de contacto y estado del cliente.</CardDescription>
                    </div>
                    <Badge variant="secondary">{client?.status?.name ?? 'Sin estado'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 px-8 pb-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-3xl border border-border bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                      <div className="flex items-center gap-2 text-base font-medium text-slate-900">
                        <Mail className="h-4 w-4 text-primary" />
                        {client?.email ?? 'No registrado'}
                      </div>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-border bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Teléfono</p>
                      <div className="flex items-center gap-2 text-base font-medium text-slate-900">
                        <Phone className="h-4 w-4 text-primary" />
                        {client?.phone ?? 'No registrado'}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-3xl border border-border bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ubicación</p>
                      <div className="flex items-center gap-2 text-base font-medium text-slate-900">
                        <MapPin className="h-4 w-4 text-primary" />
                        {client?.city ?? 'Sin ciudad'}, {client?.country ?? 'Sin país'}
                      </div>
                    </div>
                    <div className="space-y-2 rounded-3xl border border-border bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Última compra</p>
                      <div className="flex items-center gap-2 text-base font-medium text-slate-900">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {client?.last_purchase_date ?? 'Sin historial'}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-border p-6">
                      <p className="text-sm text-muted-foreground">Compras totales</p>
                      <p className="mt-3 text-3xl font-semibold">{client?.total_purchases}</p>
                    </div>
                    <div className="rounded-3xl border border-border p-6">
                      <p className="text-sm text-muted-foreground">Lifetime Value</p>
                      <p className="mt-3 text-3xl font-semibold">${client ? client.lifetime_value.toLocaleString() : '0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border bg-white shadow-xl">
                <CardHeader className="px-8 py-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">Historial</CardTitle>
                      <CardDescription>Actividad y ventas recientes del cliente.</CardDescription>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <Activity className="h-4 w-4 text-primary" />
                      {historyEntries.length} eventos
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {(['overview', 'history'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          activeTab === tab
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-border bg-white text-slate-700'
                        }`}
                      >
                        {tab === 'overview' ? 'Resumen' : 'Cronograma'}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-8">
                  {activeTab === 'overview' ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl border border-border bg-white p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Eventos</p>
                        <p className="mt-3 text-3xl font-semibold">{eventSummary.totalEvents}</p>
                      </div>
                      <div className="rounded-3xl border border-border bg-white p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Ventas registradas</p>
                        <p className="mt-3 text-3xl font-semibold">{eventSummary.saleEvents}</p>
                      </div>
                      <div className="rounded-3xl border border-border bg-white p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Vehículos</p>
                        <p className="mt-3 text-3xl font-semibold">{eventSummary.clientVehicles}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(timelineByDate).map(([dateLabel, items]) => (
                        <div key={dateLabel} className="rounded-3xl border border-border bg-slate-50 p-4">
                          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">{dateLabel}</p>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.id} className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                  </div>
                                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
                                    {formatDate(item.date)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-3xl border border-border bg-white shadow-xl">
                <CardHeader className="px-8 py-8">
                  <CardTitle className="text-2xl">Acciones rápidas</CardTitle>
                  <CardDescription>Actualiza información clave sin salir del perfil.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 px-8 pb-8">
                  <form className="space-y-6" onSubmit={handleQuickSave}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <Input
                          type="email"
                          value={quickForm.email ?? ''}
                          onChange={(event) => setQuickForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="cliente@empresa.com"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                        <Input
                          type="tel"
                          value={quickForm.phone ?? ''}
                          onChange={(event) => setQuickForm((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="+54 9 11 1234 5678"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
                        <Input
                          value={quickForm.client_status_id ?? ''}
                          onChange={(event) => setQuickForm((prev) => ({ ...prev, client_status_id: event.target.value }))}
                          placeholder="Active"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Activo</label>
                        <div className="flex items-center gap-3 rounded-3xl border border-border bg-slate-50 p-4">
                          <input
                            type="checkbox"
                            checked={quickForm.is_active ?? false}
                            onChange={(event) => setQuickForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                            className="h-5 w-5 rounded border-border bg-background"
                          />
                          <span className="text-sm text-slate-900">Cliente activo</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Ciudad</label>
                        <Input
                          value={quickForm.city ?? ''}
                          onChange={(event) => setQuickForm((prev) => ({ ...prev, city: event.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">País</label>
                        <Input
                          value={quickForm.country ?? ''}
                          onChange={(event) => setQuickForm((prev) => ({ ...prev, country: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Dirección</label>
                      <Input
                        value={quickForm.address ?? ''}
                        onChange={(event) => setQuickForm((prev) => ({ ...prev, address: event.target.value }))}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
                        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                        <Button variant="outline" type="button" onClick={() => fetchClient()}>
                          <RefreshCcw className="mr-2 h-4 w-4" /> Refrescar datos
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Acciones rápidas</p>
                    <p className="text-sm text-muted-foreground">Actualiza y sigue el historial del cliente.</p>
                  </div>
                  <Badge variant="secondary">{client?.vehicles_count ?? 0} vehículos</Badge>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Información sincronizada
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Todos los cambios rápidos se guardan directamente en el perfil del cliente y se usan para segmentación inmediata.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => router.push(`/dashboard/clients/${clientId}/edit`)}>
                    Editar perfil completo
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
}
