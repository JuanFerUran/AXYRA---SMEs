'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  TrendingUp,
  ShoppingCart,
  Clock,
  Calendar,
  Zap,
  BarChart3,
  Activity,
} from 'lucide-react';
import { StatCard, GradientCard } from '@/components/animations/animated-cards';
import { MotionContainer, MotionItem } from '@/components/animations/motion';
import { DataTable } from '@/components/animations/data-table';
import { FirstSetupModal } from '@/components/onboarding/first-setup-modal';
import { AutomationCenterPanel } from '@/components/dashboard/automation-center-panel';
import { QuickActionsPanel } from '@/components/dashboard/quick-actions-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/features/clients/hooks/useClients';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const AnimatedChart = dynamic(
  () => import('@/components/animations/animated-chart').then((mod) => mod.AnimatedChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-75 w-full" />
      </div>
    ),
  }
);

const ClientForm = dynamic(() => import('./clients/client-form').then((mod) => mod.ClientForm), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="h-6 w-40" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  ),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  const { session, companyId, isLoading: authLoading } = useSupabaseAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { clients, isLoading } = useClients({
    filters: companyId ? { company_id: companyId } : undefined,
    autoFetch: Boolean(session),
  });

  const specialization = useMemo(() => {
    const metadataSpecialization =
      session?.user.user_metadata?.specialization ||
      session?.user.app_metadata?.specialization ||
      session?.user.user_metadata?.role ||
      session?.user.app_metadata?.role ||
      'Sin asignar';

    return typeof metadataSpecialization === 'string' ? metadataSpecialization : 'Sin asignar';
  }, [session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = window.localStorage.getItem('axyra-first-setup-completed');
    if (!completed) {
      const timeout = window.setTimeout(() => setShowSetupModal(true), 800);
      return () => window.clearTimeout(timeout);
    }
  }, []);

  const salesData = useMemo(
    () => [
      { name: 'Mon', value: 2400, sales: 1200 },
      { name: 'Tue', value: 1398, sales: 1221 },
      { name: 'Wed', value: 9800, sales: 2290 },
      { name: 'Thu', value: 3908, sales: 2000 },
      { name: 'Fri', value: 4800, sales: 2181 },
      { name: 'Sat', value: 3800, sales: 2500 },
    ],
    []
  );

  const revenueData = useMemo(
    () => [
      { name: 'Q1', value: 45000 },
      { name: 'Q2', value: 52000 },
      { name: 'Q3', value: 48000 },
      { name: 'Q4', value: 61000 },
    ],
    []
  );

  const topClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (b.lifetime_value || 0) - (a.lifetime_value || 0))
        .slice(0, 5)
        .map((client, idx) => ({
          id: client.id,
          first_name: client.first_name || '—',
          last_name: client.last_name || '—',
          lifetime_value: client.lifetime_value || 0,
          rank: idx + 1,
        })),
    [clients]
  );

  const topClientsColumns = [
    {
      key: 'rank' as const,
      label: '#',
      render: (value: number) => (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {value}
        </span>
      ),
    },
    { key: 'first_name' as const, label: 'First Name' },
    { key: 'last_name' as const, label: 'Last Name' },
    {
      key: 'lifetime_value' as const,
      label: 'Lifetime Value',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Welcome Banner */}
      <MotionItem className="mb-8">
        <GradientCard gradient="blue" className="relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="mt-2 text-white/80">
              {session?.user.email
                ? `Signed in as ${session.user.email}`
                : "Here's what's happening with your business today"}
            </p>
            {companyId && (
              <p className="mt-2 text-white/80">Company ID: {companyId}</p>
            )}
            <p className="mt-2 text-white/80">Especialización: {specialization}</p>
          </div>
          <motion.div
            className="absolute right -10 top -10 h-40 w-40 rounded-full bg-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </GradientCard>
      </MotionItem>

      <MotionItem className="mb-8">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <p className="font-semibold">Vista base compartida</p>
          <p className="mt-1 text-cyan-50/80">
            Todos los usuarios ingresan al mismo dashboard central. La especialización por rol, módulo o plan se asignará dentro de esta estructura para mantener una experiencia unificada.
          </p>
        </div>
      </MotionItem>

      <MotionItem className="mb-8">
        <QuickActionsPanel />
      </MotionItem>

      <MotionItem className="mb-8">
        <AutomationCenterPanel clients={clients} />
      </MotionItem>

      {/* KPI Cards */}
      <MotionItem className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={clients.length}
            icon={<Users className="h-5 w-5" />}
            subtext="All time"
            delay={0}
          />
          <StatCard
            title="Active Clients"
            value={clients.filter((c) => Boolean(c.is_active)).length}
            icon={<Activity className="h-5 w-5" />}
            subtext="Currently active"
            trend={8}
            delay={0.1}
          />
          <StatCard
            title="Total Revenue"
            value={`$${clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            subtext="Lifetime value"
            trend={12}
            delay={0.2}
          />
          <StatCard
            title="Avg. Order Value"
            value={`$${((clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / (clients.length || 1)) || 0).toFixed(0)}`}
            icon={<ShoppingCart className="h-5 w-5" />}
            subtext="Per transaction"
            delay={0.3}
          />
        </div>
      </MotionItem>

      {/* Charts Section */}
      <MotionItem className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnimatedChart
          data={salesData}
          type="line"
          dataKey="value"
          title="Weekly Sales Performance"
          height={300}
          delay={0.2}
        />
        <AnimatedChart
          data={revenueData}
          type="bar"
          dataKey="value"
          title="Quarterly Revenue"
          height={300}
          delay={0.3}
        />
      </MotionItem>

      {/* Additional Info */}
      <MotionItem className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="mt-2 text-2xl font-bold">24</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Birthdays This Week</p>
              <p className="mt-2 text-2xl font-bold">5</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Automations Running</p>
              <p className="mt-2 text-2xl font-bold">12</p>
            </div>
            <Zap className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>
      </MotionItem>

      {/* Top Clients Table */}
      <MotionItem className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Top Clients</h2>
        <DataTable
          columns={topClientsColumns}
          data={topClients}
          isLoading={isLoading}
        />
      </MotionItem>

      {/* New Client Form */}
      {companyId && (
        <MotionItem className="rounded-lg border border-border bg-card p-6">
          <ClientForm companyId={companyId} />
        </MotionItem>
      )}

      <MotionItem className="mt-8">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Progreso</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Tu negocio está avanzando</h3>
            </div>
            <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
              {clients.length > 0 ? 'Activa' : 'Configurando'}
            </div>
          </div>
        </div>
      </MotionItem>

      <FirstSetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} />
    </motion.div>
  );
}
