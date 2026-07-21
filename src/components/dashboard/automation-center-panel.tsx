'use client';

import { motion } from 'framer-motion';
import { BellRing, CheckCircle2, Sparkles, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ClientLike {
  id?: string;
  is_active?: boolean;
  date_of_birth?: string | null;
  last_purchase_date?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

interface AutomationCenterPanelProps {
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

export function AutomationCenterPanel({ clients }: AutomationCenterPanelProps) {
  const [enabledAutomations, setEnabledAutomations] = useState<string[]>(['followups', 'birthdays']);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('axyra-automations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setEnabledAutomations(parsed);
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('axyra-automations', JSON.stringify(enabledAutomations));
  }, [enabledAutomations]);

  const metrics = useMemo(() => {
    const reengageCandidates = clients.filter((client) => {
      const lastPurchase = parseDate(client.last_purchase_date);
      if (!lastPurchase) return false;
      const days = (Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);
      return !client.is_active && days > 60;
    });

    const birthdaySoon = clients.filter((client) => isBirthdayWithin(client.date_of_birth, 14));

    return {
      reengageCandidates,
      birthdaySoon,
      followUps: Math.max(1, Math.min(5, Math.ceil(clients.length / 4))),
    };
  }, [clients]);

  const suggestions = [
    {
      id: 'followups',
      title: 'Seguimiento automático',
      description: `${metrics.followUps} clientes necesitan contacto de seguimiento esta semana.`,
      icon: Workflow,
      accent: 'from-cyan-500 to-fuchsia-500',
    },
    {
      id: 'birthdays',
      title: 'Cumpleaños cercanos',
      description: `${metrics.birthdaySoon.length} clientes tienen cumpleaños en los próximos 14 días.`,
      icon: Sparkles,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      id: 'reengage',
      title: 'Reactivación',
      description: `${metrics.reengageCandidates.length} clientes pueden reactivarse con un mensaje oportuno.`,
      icon: BellRing,
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  const toggleAutomation = (id: string) => {
    setEnabledAutomations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-500/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Automatizaciones inteligentes</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Haz que tu operación se mueva sola</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Acelera seguimiento, reactivación y recordatorios para que el negocio avance sin perder tiempo.
          </p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {enabledAutomations.length} flujos activos
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {suggestions.map((item) => {
          const Icon = item.icon;
          const enabled = enabledAutomations.includes(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-slate-800/60 p-5"
            >
              <div className={`mb-4 inline-flex rounded-2xl bg-linear-to-br ${item.accent} p-3 text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              <button
                onClick={() => toggleAutomation(item.id)}
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all ${
                  enabled
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {enabled ? <CheckCircle2 className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
                {enabled ? 'Activo' : 'Activar'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
