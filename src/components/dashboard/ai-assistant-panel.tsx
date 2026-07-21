'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BellRing, BrainCircuit, CalendarClock, Sparkles, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface ClientLike {
  id?: string;
  is_active?: boolean;
  date_of_birth?: string | null;
  last_purchase_date?: string | null;
  lifetime_value?: number | null;
}

interface AIAssistantPanelProps {
  clients: ClientLike[];
}

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isBirthdayWithin = (value?: string | null, days = 14) => {
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

export function AIAssistantPanel({ clients }: AIAssistantPanelProps) {
  const metrics = useMemo(() => {
    const reactivationCandidates = clients.filter((client) => {
      const lastPurchase = parseDate(client.last_purchase_date);
      if (!lastPurchase || client.is_active) return false;
      const days = (Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);
      return days > 60;
    });

    const birthdaySoon = clients.filter((client) => isBirthdayWithin(client.date_of_birth, 14));
    const premiumClients = clients.filter((client) => (client.lifetime_value || 0) >= 6000);
    const followUps = Math.max(1, Math.min(6, Math.ceil(clients.length / 3)));

    return {
      reactivationCandidates,
      birthdaySoon,
      premiumClients,
      followUps,
    };
  }, [clients]);

  const recommendations = [
    {
      title: 'Seguimiento de alto valor',
      description: `${metrics.followUps} clientes necesitan un contacto cercano para sostener ingresos y confianza.`,
      icon: TrendingUp,
      accent: 'from-cyan-500 to-fuchsia-500',
    },
    {
      title: 'Reactivación oportuna',
      description: `${metrics.reactivationCandidates.length} clientes inactivos pueden volver con un mensaje bien posicionado.`,
      icon: BellRing,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Cumpleaños y ocasiones',
      description: `${metrics.birthdaySoon.length} clientes tienen celebraciones próximamente; eso suele impulsar una venta o gesto valioso.`,
      icon: CalendarClock,
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-fuchsia-500/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Asistente inteligente</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Tu negocio, guiado por señales reales</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            AXYRA convierte tu base de clientes en piezas de acción: seguimiento, reactivación y oportunidades de crecimiento.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200">
          <BrainCircuit className="h-4 w-4" />
          IA activa
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Momento de impacto</p>
              <p className="mt-1 text-sm text-slate-400">Estas son las señales más útiles para este momento.</p>
            </div>
            <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
              +{metrics.premiumClients.length} premium
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Seguimiento</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.followUps}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reactivación</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.reactivationCandidates.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Cumpleaños</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.birthdaySoon.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="rounded-2xl border border-white/10 bg-slate-800/60 p-4"
              >
                <div className={`mb-3 inline-flex rounded-2xl bg-linear-to-br ${item.accent} p-2.5 text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
