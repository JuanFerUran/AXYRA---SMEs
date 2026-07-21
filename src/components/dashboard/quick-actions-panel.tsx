'use client';

import { motion } from 'framer-motion';
import { BellRing, Sparkles, TrendingUp, Workflow } from 'lucide-react';

const actions = [
  {
    title: 'Automatizaciones',
    description: 'Activa recordatorios y flujos inteligentes.',
    icon: Workflow,
    accent: 'from-cyan-500 to-fuchsia-500',
  },
  {
    title: 'Alertas',
    description: 'Recibe avisos clave para clientes y ventas.',
    icon: BellRing,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Insights',
    description: 'Descubre oportunidades sin perder tiempo.',
    icon: TrendingUp,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Comenzar Premium',
    description: 'Configura tu experiencia inicial en 2 minutos.',
    icon: Sparkles,
    accent: 'from-violet-500 to-fuchsia-500',
  },
];

export function QuickActionsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg"
          >
            <div
              className={`mb-4 inline-flex rounded-2xl bg-linear-to-br ${action.accent} p-3 text-white`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-white">{action.title}</p>
            <p className="mt-2 text-sm text-slate-400">{action.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
