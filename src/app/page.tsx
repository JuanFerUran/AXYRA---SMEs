'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Zap, PieChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroParticles = [
  { x: '10%', y: '15%', size: 16, blur: 'blur-2xl', color: 'bg-cyan-400/25' },
  { x: '80%', y: '8%', size: 24, blur: 'blur-3xl', color: 'bg-fuchsia-400/20' },
  { x: '15%', y: '65%', size: 18, blur: 'blur-2xl', color: 'bg-sky-400/15' },
  { x: '70%', y: '72%', size: 14, blur: 'blur-2xl', color: 'bg-violet-400/10' },
  { x: '50%', y: '32%', size: 12, blur: 'blur-2xl', color: 'bg-white/10' },
];

const carouselItems = [
  {
    title: 'Respuestas instantáneas',
    description: 'Recibe información de tu negocio en segundos con paneles reactivos y datos en tiempo real.',
    accent: 'bg-cyan-400/15 text-cyan-200',
  },
  {
    title: 'Automatizaciones avanzadas',
    description: 'Lleva flujos complejos a un solo clic con reglas y conexiones inteligentes.',
    accent: 'bg-fuchsia-400/15 text-fuchsia-200',
  },
  {
    title: 'Clientes hipersegmentados',
    description: 'Clasifica y actúa según comportamiento, historial y valor de vida del cliente.',
    accent: 'bg-emerald-400/15 text-emerald-200',
  },
];

const featureCards = [
  { title: 'Dashboard', description: 'Resúmenes y gráficos clave.', href: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Clientes', description: 'Controla tu cartera y vida útil.', href: '/dashboard/clients', icon: <Users className="h-5 w-5" /> },
  { title: 'Automatizaciones', description: 'Define flujos eficientes.', href: '/dashboard', icon: <Zap className="h-5 w-5" /> },
  { title: 'Reportes', description: 'Genera insights con datos.', href: '/dashboard', icon: <PieChart className="h-5 w-5" /> },
];

export default function Home() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const { scrollYProgress } = useScroll();
  const yOffset1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yOffset2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.85, 0.65]);

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      {heroParticles.map((particle, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: index * 0.1 }}
          className={`pointer-events-none absolute rounded-full ${particle.blur} ${particle.color}`}
          style={{ left: particle.x, top: particle.y, width: particle.size, height: particle.size }}
        />
      ))}
      <motion.div
        style={{
          y: yOffset1,
          opacity,
          backgroundImage:
            'radial-gradient(circle at top left, rgba(96,165,250,0.35), transparent 35%), radial-gradient(circle at top right, rgba(139,92,246,0.25), transparent 30%)',
        }}
        className="pointer-events-none absolute inset-x-0 top-0 h-105"
      />
      <motion.div
        style={{ y: yOffset2 }}
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-linear-to-br from-cyan-400/15 via-transparent to-fuchsia-500/10 blur-3xl"
      />
      <motion.main className="relative min-h-screen px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute left-0 top-24 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div className="space-y-6">
                <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Experiencia UX con movimiento
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="text-5xl font-bold tracking-tight text-white sm:text-6xl"
                >
                  Impacto visual, datos reales y movimiento infinito.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
                  className="max-w-3xl text-lg leading-8 text-slate-300"
                >
                  BIA Platform ya no es solo un dashboard: es una experiencia interactiva que conecta tu operación con métricas, clientes y automatizaciones en una sola pantalla.
                </motion.p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => router.push('/dashboard')} className="min-w-45 shadow-xl shadow-cyan-500/20">
                    Explorar Dashboard
                  </Button>
                  <Button variant="secondary" onClick={() => router.push('/dashboard/clients')} className="min-w-45">
                    Ver Clientes
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/50"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-cyan-400 to-fuchsia-500" />
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Progreso del AI</p>
                      <h2 className="mt-2 text-3xl font-semibold text-white">70%</h2>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-200">
                      En vivo</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                      <span>Conversion</span>
                      <span>+18%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[70%] rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-400" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Clientes activos</p>
                      <p className="mt-2 text-2xl font-semibold text-white">1,248</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Automatizaciones</p>
                      <p className="mt-2 text-2xl font-semibold text-white">32</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/30 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-cyan-300">
                    {item.icon}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                    Nuevo
                  </span>
                </div>
                <h2 className="mt-8 text-2xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <Button
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur"
                >
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.article>
            ))}
          </section>

          <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Funciones que atrapan</p>
                <h2 className="mt-4 text-4xl font-bold text-white">Fondo animado, interacción y experiencia inmersiva.</h2>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  A medida que el usuario baja, los elementos flotantes se mueven, las tarjetas cobran vida y el diseño mantiene un pulso visual fuerte y profesional.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-inner shadow-slate-950/20">
                <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/10 to-transparent" />
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-500/10">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Carrusel</p>
                      <p className="mt-2 text-2xl font-semibold text-white">Explora beneficios</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                      Más rápido
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${carouselItems[activeSlide].accent}`}>
                          <Zap className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{carouselItems[activeSlide].title}</p>
                          <p className="mt-2 text-lg font-semibold text-white">{carouselItems[activeSlide].description}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveSlide((prev) => (prev + 1) % carouselItems.length)}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </motion.main>
    </main>
  );
}
