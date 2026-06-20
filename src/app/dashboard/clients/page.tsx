'use client';

import { useMemo, useState, useCallback } from 'react';
import { Plus, Search, Download, TrendingUp } from 'lucide-react';
import { useClients } from '@/features/clients/hooks/useClients';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { ClientList } from '@/features/clients/ui/client-card';
import { StatCard, GradientCard } from '@/components/animations/animated-cards';
import { AnimatedChart } from '@/components/animations/animated-chart';
import { MotionContainer, MotionItem } from '@/components/animations/motion';
import { DataTable } from '@/components/animations/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClientWithRelations } from '@/features/clients/types/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const sortOptions = [
  { key: 'created_at', label: 'Más recientes' },
  { key: 'lifetime_value', label: 'Mayor CLV' },
  { key: 'first_name', label: 'Nombre' },
];

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isBirthdayWithin = (value?: string | null, days = 30) => {
  if (!value) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (!month || !day) return false;
  const today = new Date();
  const currentYearBirthday = new Date(today.getFullYear(), month - 1, day);
  const nextBirthday = currentYearBirthday < today
    ? new Date(today.getFullYear() + 1, month - 1, day)
    : currentYearBirthday;
  const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

const formatMoney = (value: number) => `$${value.toLocaleString()}`;

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

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [minLifetimeValue, setMinLifetimeValue] = useState('');
  const [maxLifetimeValue, setMaxLifetimeValue] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'lifetime_value' | 'first_name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { companyId, isLoading: authLoading } = useSupabaseAuth();

  const filters = useMemo(
    () => ({
      company_id: companyId || undefined,
      search: searchQuery || undefined,
      status_id: statusFilter || undefined,
      is_active:
        activeFilter === 'all' ? undefined : activeFilter === 'active',
      country: countryFilter || undefined,
      min_lifetime_value: minLifetimeValue ? Number(minLifetimeValue) : undefined,
      max_lifetime_value: maxLifetimeValue ? Number(maxLifetimeValue) : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [companyId, searchQuery, statusFilter, activeFilter, countryFilter, minLifetimeValue, maxLifetimeValue, sortBy, sortOrder]
  );

  const { clients, isLoading, deleteClient } = useClients({
    filters,
    autoFetch: Boolean(companyId),
  });

  const activeClients = useMemo(
    () => clients.filter((client) => client.is_active).length,
    [clients]
  );

  const totalLifetimeValue = useMemo(
    () => clients.reduce((sum, client) => sum + client.lifetime_value, 0),
    [clients]
  );

  const inactiveClients = useMemo(
    () => clients.filter((client) => !client.is_active).length,
    [clients]
  );

  const premiumClients = useMemo(
    () => clients.filter((client) => client.lifetime_value >= 6000).length,
    [clients]
  );

  const reengageClients = useMemo(
    () => clients.filter((client) => !client.is_active && parseDate(client.last_purchase_date) &&
      (Date.now() - parseDate(client.last_purchase_date)!.getTime()) / (1000 * 60 * 60 * 24) > 60
    ).length,
    [clients]
  );

  const birthdayClients = useMemo(
    () => clients.filter((client) => isBirthdayWithin(client.date_of_birth)).length,
    [clients]
  );

  const recentClients = useMemo(
    () => clients.filter((client) => {
      const created = parseDate(client.created_at);
      return created ? (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24) <= 30 : false;
    }).length,
    [clients]
  );

  const handleDelete = useCallback(
    async (clientId: string) => {
      if (!confirm('¿Eliminar este cliente?')) return;
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    },
    [deleteClient]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setActiveFilter('all');
    setCountryFilter('');
    setMinLifetimeValue('');
    setMaxLifetimeValue('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <MotionContainer className="min-h-screen bg-background p-6 md:p-8" variants={containerVariants}>
      <MotionItem variants={itemVariants} className="mb-8 rounded-[2rem] border border-border bg-card p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Gestión de clientes</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Conecta con tu base de clientes y toma mejores decisiones.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Filtra, segmenta y gestiona clientes por empresa con una experiencia visual clara y datos en tiempo real.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="default" className="w-full" onClick={() => window.location.assign('/dashboard/clients/new')}>
              <Plus className="h-4 w-4" /> Nuevo cliente
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => window.location.reload()}>
              <Download className="h-4 w-4" /> Actualizar
            </Button>
          </div>
        </div>
      </MotionItem>

      <MotionItem variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes activos</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">{activeClients}</h2>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-4 w-4" />
                </span>
                Filtro por empresa
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Todos</p>
                <p className="mt-2 text-2xl font-semibold">{clients.length}</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Valor total</p>
                <p className="mt-2 text-2xl font-semibold">${totalLifetimeValue.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Media CLV</p>
                <p className="mt-2 text-2xl font-semibold">${(clients.length ? (totalLifetimeValue / clients.length).toFixed(0) : '0')}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <StatCard title="Clientes" value={clients.length} subtext="Empresa actual" delay={0} />
            <StatCard title="Activos" value={activeClients} subtext="Estado actual" delay={0.1} />
            <StatCard title="Inactivos" value={inactiveClients} subtext="A reactivar" delay={0.2} />
          </div>

          <MotionItem variants={itemVariants} className="grid gap-4 lg:grid-cols-2">
            <GradientCard gradient="green" className="min-h-40">
              <div>
                <p className="text-sm font-medium text-white/80">Clientes premium</p>
                <p className="mt-4 text-3xl font-semibold">{premiumClients}</p>
                <p className="mt-2 text-sm text-white/80">CLV superior a $6.000</p>
              </div>
            </GradientCard>
            <GradientCard gradient="purple" className="min-h-40">
              <div>
                <p className="text-sm font-medium text-white/80">Reenganche</p>
                <p className="mt-4 text-3xl font-semibold">{reengageClients}</p>
                <p className="mt-2 text-sm text-white/80">Inactivos desde hace más de 60 días</p>
              </div>
            </GradientCard>
            <GradientCard gradient="blue" className="min-h-40">
              <div>
                <p className="text-sm font-medium text-white/80">Nuevos últimos 30 días</p>
                <p className="mt-4 text-3xl font-semibold">{recentClients}</p>
                <p className="mt-2 text-sm text-white/80">Clientes añadidos recientemente</p>
              </div>
            </GradientCard>
            <GradientCard gradient="pink" className="min-h-40">
              <div>
                <p className="text-sm font-medium text-white/80">Cumpleaños próximos</p>
                <p className="mt-4 text-3xl font-semibold">{birthdayClients}</p>
                <p className="mt-2 text-sm text-white/80">En los próximos 30 días</p>
              </div>
            </GradientCard>
          </MotionItem>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Tendencia de clientes</h3>
                <p className="text-sm text-muted-foreground">Crecimiento mensual de la base.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <TrendingUp className="h-4 w-4 text-primary" /> Última actualización automática
              </div>
            </div>
            <AnimatedChart
              data={[
                { name: 'Ene', value: 24 },
                { name: 'Feb', value: 36 },
                { name: 'Mar', value: 42 },
                { name: 'Abr', value: 52 },
                { name: 'May', value: 67 },
                { name: 'Jun', value: 79 },
              ]}
              type="area"
              dataKey="value"
              title="Clientes nuevos"
              height={320}
              delay={0.1}
            />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Explorar clientes</h3>
                <p className="text-sm text-muted-foreground">Busca por nombre, correo o teléfono.</p>
              </div>
              <div className="flex items-center gap-2 rounded-3xl border border-border bg-slate-50 p-2">
                {(['grid', 'list', 'table'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-5 relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar clientes..."
                className="pl-11"
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Filtros avanzados</p>
                  <p className="text-sm text-muted-foreground">Refina la lista por estado, país y rango de valor.</p>
                </div>
                <Button size="sm" variant={isFilterOpen ? 'secondary' : 'outline'} onClick={() => setIsFilterOpen((prev) => !prev)}>
                  {isFilterOpen ? 'Ocultar' : 'Mostrar'} filtros
                </Button>
              </div>

              {isFilterOpen && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
                    <Input
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      placeholder="ID de estado"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Visibilidad</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={activeFilter}
                      onChange={(event) => setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')}
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">País</label>
                    <Input
                      value={countryFilter}
                      onChange={(event) => setCountryFilter(event.target.value)}
                      placeholder="Argentina, Chile..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">CLV mínimo</label>
                    <Input
                      type="number"
                      value={minLifetimeValue}
                      onChange={(event) => setMinLifetimeValue(event.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">CLV máximo</label>
                    <Input
                      type="number"
                      value={maxLifetimeValue}
                      onChange={(event) => setMaxLifetimeValue(event.target.value)}
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Ordenar por</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as 'created_at' | 'lifetime_value' | 'first_name')}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Orden</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
                    >
                      <option value="desc">Descendente</option>
                      <option value="asc">Ascendente</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {searchQuery && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Buscar: {searchQuery}</span>}
                {statusFilter && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Estado: {statusFilter}</span>}
                {activeFilter !== 'all' && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Activo: {activeFilter}</span>}
                {countryFilter && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">País: {countryFilter}</span>}
                {minLifetimeValue && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">CLV ≥ ${minLifetimeValue}</span>}
                {maxLifetimeValue && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">CLV ≤ ${maxLifetimeValue}</span>}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <DataTable
                columns={[
                  { key: 'first_name', label: 'Nombre', sortable: true },
                  { key: 'last_name', label: 'Apellido', sortable: true },
                  { key: 'email', label: 'Correo' },
                  { key: 'phone', label: 'Teléfono' },
                  { key: 'total_purchases', label: 'Compras', sortable: true },
                  {
                    key: 'lifetime_value',
                    label: 'CLV',
                    sortable: true,
                    render: (value: number) => `$${value.toLocaleString()}`,
                  },
                ]}
                data={clients}
                isLoading={isLoading}
                rowClassName="cursor-pointer"
                onRowClick={(row) => window.location.assign(`/dashboard/clients/${row.id}`)}
              />
            </div>
          ) : (
            <div className={viewMode === 'list' ? 'space-y-4' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
              <ClientList
                clients={clients}
                isLoading={isLoading}
                onDelete={handleDelete}
                onClick={(client) => window.location.assign(`/dashboard/clients/${client.id}`)}
                variant={viewMode === 'list' ? 'list' : 'grid'}
              />
            </div>
          )}
        </div>
      </MotionItem>
    </MotionContainer>
  );
}
