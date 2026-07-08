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
    title: 'Visión clara del negocio',
    description: 'Convierte datos dispersos en una vista útil para vender mejor, priorizar y actuar con rapidez.',
    accent: 'bg-cyan-400/15 text-cyan-200',
  },
  {
    title: 'Automatización que ahorra tiempo',
    description: 'Reduce tareas repetitivas y deja que el equipo se enfoque en clientes, oportunidades y resultados.',
    accent: 'bg-fuchsia-400/15 text-fuchsia-200',
  },
  {
    title: 'Experiencia más consistente',
    description: 'Mejora el seguimiento, la atención y la ejecución para que clientes y equipos trabajen sobre la misma base.',
    accent: 'bg-emerald-400/15 text-emerald-200',
  },
];

const featureCards = [
  { title: 'Dashboard', description: 'Observa métricas clave y toma decisiones con evidencia real.', href: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Clientes', description: 'Gestiona relaciones, seguimiento y oportunidades desde un solo lugar.', href: '/dashboard/clients', icon: <Users className="h-5 w-5" /> },
  { title: 'Automatizaciones', description: 'Reduce trabajo manual y acelera procesos repetitivos.', href: '/dashboard', icon: <Zap className="h-5 w-5" /> },
  { title: 'Reportes', description: 'Convierte datos en decisiones, propuestas y acciones comerciales.', href: '/dashboard', icon: <PieChart className="h-5 w-5" /> },
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

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Solución para vender mejor y operar con más control
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="text-5xl font-bold tracking-tight text-white sm:text-6xl"
                >
                  Una plataforma que conecta ventas, clientes y operaciones en un mismo ecosistema.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
                  className="max-w-3xl text-lg leading-8 text-slate-300"
                >
                  BIA Platform es la herramienta que ayuda a vender mejor, atender mejor y operar con más disciplina. Diseñada para equipos que necesitan claridad, automatización y una experiencia más consistente para sus clientes, sin perder agilidad ni control.
                </motion.p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => router.push('/dashboard')} className="min-w-45 shadow-xl shadow-cyan-500/20">
                    Ver el tablero
                  </Button>
                  <Button variant="secondary" onClick={() => router.push('/dashboard/clients')} className="min-w-45">
                    Explorar clientes
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
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué aporta</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">Más oportunidad comercial y mejor ejecución diaria.</h2>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Centralizamos la información de clientes, ventas y procesos para que el negocio no dependa de hojas dispersas, seguimientos improvisados o respuestas tardías.</p>
                  </div>
                  <div className="grid gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">Más control para quien vende</p>
                      <p className="mt-1 text-sm text-slate-400">Tienes mejor seguimiento de oportunidades, clientes y actividad sin perder tiempo en tareas manuales.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">Mejor experiencia para quien usa la plataforma</p>
                      <p className="mt-1 text-sm text-slate-400">Un entorno más claro, más rápido y más útil para trabajar todos los días con menos fricción.</p>
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
                    Valor
                  </span>
                </div>
                <h2 className="mt-8 text-2xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <Button
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur"
                >
                  Ver más
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.article>
            ))}
          </section>

          <section className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="mb-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Propuesta de valor</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                BIA Platform combina crecimiento comercial, eficiencia operativa y una experiencia diaria más simple.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                Para quienes venden, representa una forma más clara de gestionar oportunidades y clientes. Para quienes operan, ofrece una base más ordenada para ejecutar, automatizar y escalar sin perder control.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.push('/auth/register')} className="min-w-44">
                  Crear una cuenta
                </Button>
                <Button variant="secondary" onClick={() => router.push('/dashboard')} className="min-w-44">
                  Ver la plataforma
                </Button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Para qué sirve</p>
                <h2 className="mt-4 text-4xl font-bold text-white">Pensada tanto para quien vende como para quien gestiona y usa la plataforma cada día.</h2>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  No se trata de agregar una herramienta más, sino de ofrecer una solución que ayude a cerrar mejor oportunidades, cuidar clientes y ejecutar operaciones con mayor claridad, rapidez y consistencia.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">1. Capturamos</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">Recopilamos información de clientes, actividad y operaciones para evitar depender de datos dispersos.</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">2. Automatizamos</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">Eliminamos tareas manuales repetitivas para que el equipo pueda enfocarse en lo que realmente mueve el negocio.</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">3. Optimizamos</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">Generamos mejor visibilidad para detectar oportunidades, corregir cuellos de botella y escalar con más control.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </motion.main>
    </main>
  );
}
