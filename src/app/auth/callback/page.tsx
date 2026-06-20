'use client';

import { Suspense } from 'react';
import CallbackContent from './callback-content';

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin rounded-full border-4 border-slate-200 border-t-primary h-12 w-12"></div>
          <p className="text-slate-600">Procesando autenticación...</p>
        </div>
      </main>
    }>
      <CallbackContent />
    </Suspense>
  );
}
