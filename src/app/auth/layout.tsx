import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BIA Platform - Autenticación',
  description: 'Inicia sesión o regístrate para acceder a BIA Platform',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
