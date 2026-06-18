'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          BIA Platform
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Business Intelligence & Automation Platform for SMEs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                Visualiza tus métricas de negocio en tiempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ir al Dashboard</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Gestiona y analiza información de tus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Gestionar Clientes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatizaciones</CardTitle>
              <CardDescription>
                Configura flujos automáticos con n8n.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Configurar Automaciones</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
              <CardDescription>
                Accede a reportes avanzados con Power BI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver Reportes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
