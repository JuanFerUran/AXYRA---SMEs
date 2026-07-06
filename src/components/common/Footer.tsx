import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <p>&copy; 2026 BIA Platform. Todos los derechos reservados.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="transition hover:text-white">
            Inicio
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/dashboard/clients" className="transition hover:text-white">
            Clientes
          </Link>
        </div>
      </div>
    </footer>
  );
}
