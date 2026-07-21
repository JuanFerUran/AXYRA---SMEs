'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BellRing, Briefcase, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FirstSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goals = [
  {
    id: 'growth',
    title: 'Crecimiento',
    description: 'Quiero vender más y convertir mejor cada oportunidad.',
    icon: TrendingUp,
  },
  {
    id: 'control',
    title: 'Control',
    description: 'Quiero ver todo claro con menos esfuerzo diario.',
    icon: Briefcase,
  },
  {
    id: 'automation',
    title: 'Automatización',
    description: 'Quiero que el sistema me ayude a trabajar mejor.',
    icon: BellRing,
  },
];

const modules = [
  { id: 'clients', label: 'Clientes', description: 'Seguimiento, estado y relación con cada cliente.' },
  { id: 'sales', label: 'Ventas', description: 'Oportunidades, ingresos y actividad comercial.' },
  { id: 'automation', label: 'Automatización', description: 'Recordatorios, tareas y flujos inteligentes.' },
];

export function FirstSetupModal({ isOpen, onClose }: FirstSetupModalProps) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string>('growth');
  const [selectedModules, setSelectedModules] = useState<string[]>(['clients', 'automation']);

  const progress = useMemo(() => {
    if (step === 0) return 33;
    if (step === 1) return 66;
    return 100;
  }, [step]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('axyra-first-setup-completed', 'true');
      window.localStorage.setItem('axyra-first-setup-goal', selectedGoal);
      window.localStorage.setItem('axyra-first-setup-modules', JSON.stringify(selectedModules));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 18, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 18, scale: 0.98 }}
          className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-cyan-500/10"
        >
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Onboarding premium</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Tu mejor comienzo en 2 minutos</h2>
            </div>
            <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
              {progress}% listo
            </div>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500"
            />
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-linear-to-br from-cyan-500 to-fuchsia-500 p-3 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Configura tu experiencia desde el inicio</p>
                    <p className="text-sm text-slate-400">AXYRA se adapta a cómo quieres trabajar, vender y crecer.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const active = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-slate-800/60 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`mb-3 h-5 w-5 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
                      <p className="font-semibold text-white">{goal.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{goal.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <p className="font-semibold text-white">Activa los módulos clave para tu operación</p>
                <p className="mt-1 text-sm text-slate-400">Puedes cambiar esto más tarde en cualquier momento.</p>
              </div>
              <div className="grid gap-3">
                {modules.map((module) => {
                  const active = selectedModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={`flex items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                        active ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-slate-800/60 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-white">{module.label}</p>
                        <p className="mt-1 text-sm text-slate-400">{module.description}</p>
                      </div>
                      {active ? <CheckCircle2 className="mt-1 h-5 w-5 text-cyan-300" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <p className="font-semibold text-emerald-100">Todo listo para empezar</p>
                <p className="mt-2 text-sm text-emerald-50/80">
                  Hemos preparado una experiencia inicial más enfocada en tus objetivos y en el valor inmediato para tu negocio.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Objetivo:</span> {goals.find((item) => item.id === selectedGoal)?.title}</p>
                <p className="mt-2"><span className="font-semibold text-white">Módulos activos:</span> {selectedModules.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
              {step === 0 ? 'Cerrar' : 'Atrás'}
            </Button>

            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>Finalizar</Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
