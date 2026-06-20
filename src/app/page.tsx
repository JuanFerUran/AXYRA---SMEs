'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Zap, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function Home() {
  const router = useRouter();

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
    >
      <div className="mx-auto max-w-5xl space-y-10">
        <motion.section variants={fadeInUp} className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Bienvenido a BIA Platform</p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                Tu centro de inteligencia y automatización.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Accede rápido a tus métricas, clientes, automatizaciones y reportes con un diseño moderno, animado y 100% funcional.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.push('/dashboard')} className="min-w-[180px] shadow-lg shadow-primary/10">
                  Ir al Dashboard
                </Button>
                <Button variant="secondary" onClick={() => router.push('/dashboard/clients')} className="min-w-[180px]">
                  Ver Clientes
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <motion.div whileHover={{ y: -5 }} className="rounded-[2rem] bg-primary px-6 py-8 text-white shadow-2xl shadow-primary/20">
                <h2 className="text-xl font-semibold">Métricas claras</h2>
                <p className="mt-3 text-sm text-white/85">Visualiza tus indicadores clave en dashboards con animaciones suaves.</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/10">
                <h2 className="text-xl font-semibold">Automatizaciones potentes</h2>
                <p className="mt-3 text-sm text-white/80">Crea procesos que liberan tiempo y aceleran operaciones repetitivas.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeInUp} className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Dashboard', description: 'Resúmenes y gráficos clave.', href: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
            { title: 'Clientes', description: 'Controla tu cartera y vida útil.', href: '/dashboard/clients', icon: <Users className="h-5 w-5" /> },
            { title: 'Automatizaciones', description: 'Define flujos eficientes.', href: '/dashboard', icon: <Zap className="h-5 w-5" /> },
            { title: 'Reportes', description: 'Genera insights con datos.', href: '/dashboard', icon: <PieChart className="h-5 w-5" /> },
          ].map((item) => (
            <motion.article
              key={item.title}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Acceder</span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <Button
                type="button"
                onClick={() => router.push(item.href)}
                className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              >
                Abrir
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.article>
          ))}
        </motion.section>
      </div>
    </motion.main>
  );
}
