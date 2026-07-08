'use client';

import { Suspense } from 'react';
import CallbackContent from './callback-content';

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-slate-950 text-slate-50">
          <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_26%)]" />
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/95 px-10 py-16 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <div className="mb-4 inline-block animate-spin rounded-full border-4 border-slate-700 border-t-cyan-300 h-12 w-12"></div>
            <p className="text-slate-300">Procesando autenticación...</p>
          </div>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
