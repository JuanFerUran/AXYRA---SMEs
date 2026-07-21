'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UtensilsCrossed, MapPin, Briefcase, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SpecializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (specialization: string) => Promise<void>;
  isLoading?: boolean;
}

const SPECIALIZATIONS = [
  {
    id: 'restaurant',
    label: 'Restaurante',
    icon: UtensilsCrossed,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'parking',
    label: 'Parqueadero',
    icon: MapPin,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'retail',
    label: 'Tienda / Retail',
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'office',
    label: 'Oficina / Servicios',
    icon: Briefcase,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'other',
    label: 'Otro',
    icon: MoreHorizontal,
    color: 'from-slate-500 to-slate-600',
  },
];

export function SpecializationModal({
  isOpen,
  onClose,
  onSelect,
  isLoading = false,
}: SpecializationModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    await onSelect(id);
    setSelectedId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl"
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-4 rounded-lg border border-white/10 p-2 transition-colors hover:bg-white/5"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-slate-400" />
            </motion.button>

            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">¿Cuál es tu negocio?</h2>
                <p className="text-slate-400">
                  Ayúdanos a configurar BIA Platform de la mejor manera para tu tipo de negocio.
                </p>
              </div>

              {/* Specialization grid */}
              <div className="grid gap-3">
                {SPECIALIZATIONS.map((spec) => {
                  const Icon = spec.icon;
                  const isSelected = selectedId === spec.id;
                  const isDisabled = isLoading && selectedId !== spec.id;

                  return (
                    <motion.button
                      key={spec.id}
                      onClick={() => handleSelect(spec.id)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      className={`relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-slate-800/50 hover:border-white/20 hover:bg-slate-800'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${spec.color}`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white">{spec.label}</p>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-5 w-5 rounded-full border-2 border-cyan-400 bg-cyan-500"
                        />
                      )}

                      {isLoading && selectedId === spec.id && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-5 w-5"
                        >
                          <div className="h-5 w-5 rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="space-y-3 pt-4">
                <p className="text-xs text-slate-500">
                  Puedes cambiar esto más tarde en tu perfil
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
