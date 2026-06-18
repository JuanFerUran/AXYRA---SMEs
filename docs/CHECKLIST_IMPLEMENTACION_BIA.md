# 🚀 Checklist de Implementación - BIA Platform

## RESUMEN EJECUTIVO

Se ha completado el **diseño arquitectónico completo** de la Base de Datos para la BIA Platform. Los documentos generados contienen:

✅ **Modelo Entidad-Relación (MER)** con 18 tablas diseñadas  
✅ **Diccionario de Datos** detallado con 200+ columnas  
✅ **Script SQL** completo listo para Supabase (1500+ líneas)  
✅ **Estrategia de Seguridad** con RLS y auditoría  
✅ **Guías de Implementación** en Next.js y n8n  
✅ **Arquitectura Multiempresa** preparada para escalar  

---

## 📋 FASE 1: INFRAESTRUCTURA INICIAL (Semana 1)

### Paso 1.1: Crear Proyecto Supabase

- [ ] Ir a https://supabase.com
- [ ] Crear nuevo proyecto (Region: América Latina)
- [ ] Nombre: `bia-platform-prod` o `bia-platform-dev`
- [ ] Guardar credenciales:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Paso 1.2: Ejecutar Script SQL en Supabase

1. Ir a Supabase Editor → SQL
2. Crear nueva query
3. Copiar contenido de `SQL_SCRIPT_INICIAL_SUPABASE.sql`
4. Ejecutar en secciones:
   - [ ] Extensiones (primero)
   - [ ] Tipos/Enumeraciones
   - [ ] Tablas (en orden de dependencias)
   - [ ] Índices
   - [ ] Triggers y Funciones
   - [ ] RLS Políticas
   - [ ] Vistas

### Paso 1.3: Verificar Instalación

```sql
-- Ejecutar en Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Debería mostrar ~18 tablas
```

### Paso 1.4: Configurar Supabase Auth

- [ ] Ir a Settings → Auth
- [ ] Habilitar Email Provider
- [ ] Habilitar Google OAuth (opcional)
- [ ] Configurar URL de redireccionamiento:
  - `http://localhost:3000/auth/callback` (desarrollo)
  - `https://tu-dominio.com/auth/callback` (producción)
- [ ] Guardar credenciales OAuth si aplica

### Paso 1.5: Crear Storage Buckets

- [ ] Storage → Buckets → New Bucket
- [ ] Nombre: `avatars` (público)
- [ ] Nombre: `documents` (privado)
- [ ] Configurar políticas de acceso

---

## 🛠️ FASE 2: BACKEND NEXT.JS (Semana 2)

### Paso 2.1: Configurar Proyecto Next.js

```bash
# Si aún no tienes proyecto
npx create-next-app@latest bia-platform --typescript --tailwind

cd bia-platform

# Instalar dependencias
npm install @supabase/supabase-js zod next-server-actions
npm install -D jest @testing-library/react @types/jest
```

### Paso 2.2: Crear Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Desarrollo
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_ENV=development
```

### Paso 2.3: Crear Estructura de Carpetas

```bash
mkdir -p src/{
  actions,
  api/webhooks,
  components/{
    auth,
    dashboard,
    clients,
    sales,
    vehicles,
    services,
    shared
  },
  hooks,
  lib/{
    supabase,
    validation,
    utils
  },
  services/{
    clients,
    sales,
    vehicles,
    services,
    notifications
  },
  types,
  middleware
}
```

### Paso 2.4: Crear Supabase Client

Archivo: `src/lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getSupabaseServerClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
```

### Paso 2.5: Crear Server Actions Base

Archivo: `src/actions/clients.ts`

```typescript
'use server';

import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/client';

const CreateClientSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
});

export async function createClient(data: unknown) {
  try {
    const validated = CreateClientSchema.parse(data);
    const supabase = await getSupabaseServerClient();
    
    const { data: client, error } = await supabase
      .from('clients')
      .insert([validated])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data: client };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
```

### Paso 2.6: Crear Middleware de Autenticación

Archivo: `src/middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirigir a login si no hay sesión en rutas protegidas
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

### Paso 2.7: Crear Servicios de Aplicación

- [ ] `src/services/clients.ts` - CRUD de clientes
- [ ] `src/services/sales.ts` - Registro de ventas
- [ ] `src/services/vehicles.ts` - Gestión de vehículos
- [ ] `src/services/services.ts` - Catálogo de servicios
- [ ] `src/services/notifications.ts` - Envío de notificaciones

---

## 🎨 FASE 3: FRONTEND NEXT.JS (Semana 3)

### Paso 3.1: Instalar Componentes Shadcn/UI

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

### Paso 3.2: Crear Componentes Base

- [ ] `src/components/shared/Header.tsx` - Navegación
- [ ] `src/components/shared/Sidebar.tsx` - Menú lateral
- [ ] `src/components/shared/StatsCard.tsx` - Tarjeta de KPI
- [ ] `src/components/shared/DataTable.tsx` - Tabla genérica

### Paso 3.3: Crear Páginas Principales

```bash
# Autenticación
src/app/auth/
├── login/page.tsx
├── register/page.tsx
└── callback/page.tsx

# Dashboard
src/app/dashboard/
├── layout.tsx
├── page.tsx (Inicio)
├── clients/
│   ├── page.tsx (Listado)
│   ├── [id]/page.tsx (Detalle)
│   └── new/page.tsx (Crear)
├── sales/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── new/page.tsx
├── vehicles/page.tsx
├── services/page.tsx
└── settings/page.tsx
```

### Paso 3.4: Crear Componentes de Clientes

- [ ] `ClientList.tsx` - Listado con filtros
- [ ] `ClientForm.tsx` - Formulario crear/editar
- [ ] `ClientDetails.tsx` - Detalle con historial
- [ ] `ClientStatusBadge.tsx` - Indicador de estado

### Paso 3.5: Crear Componentes de Ventas

- [ ] `SaleForm.tsx` - Registro de venta
- [ ] `SaleList.tsx` - Historial de ventas
- [ ] `SaleDetails.tsx` - Detalle de venta
- [ ] `PaymentManager.tsx` - Gestión de pagos

---

## 🤖 FASE 4: AUTOMATIZACIONES N8N (Semana 4)

### Paso 4.1: Configurar Evolution API o WhatsApp Business API

**Opción A: Evolution API (Desarrollo - Recomendado)**

```bash
# Instalar Docker (si no lo tienes)
# docker run -d -p 8080:8080 --name evolution-api \
#   -e DB_CONNECTION=postgres \
#   -e DB_HOST=localhost \
#   -e DB_PORT=5432 \
#   -e DB_USER=evolution \
#   -e DB_PASSWORD=password \
#   -e DB_DATABASE=evolution \
#   docker.io/me2solutions/evolution-api:latest
```

**Opción B: WhatsApp Business API (Producción)**

1. Ir a https://developers.facebook.com
2. Crear aplicación de negocio
3. Obtener `PHONE_NUMBER_ID` y `WHATSAPP_BUSINESS_ACCOUNT_ID`
4. Generar token de acceso permanente

### Paso 4.2: Crear Webhook en Next.js para n8n

Archivo: `src/app/api/webhooks/n8n/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Registrar ejecución
    const supabase = await getSupabaseServerClient();
    
    await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: payload.workflow_id,
        company_id: payload.company_id,
        status: 'success',
        response_data: payload,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

### Paso 4.3: Crear Workflows n8n

**Workflow 1: Bienvenida de Cliente Nuevo**

1. Webhook trigger
2. Obtener datos de cliente desde Supabase
3. Formatear mensaje
4. Enviar vía WhatsApp
5. Registrar notificación

**Workflow 2: Recuperación de Inactivos**

1. Cron job (diariamente a las 8 AM)
2. Consultar Supabase: clientes inactivos 60+ días
3. Filtrar por preferred_contact = whatsapp
4. Enviar mensaje personalizado
5. Registrar en notifications

**Workflow 3: Promociones por Compra**

1. Webhook: nueva venta creada
2. Verificar si cliente >= 5 compras
3. Generar código de descuento
4. Enviar vía WhatsApp
5. Registrar promoción

**Workflow 4: Cumpleaños**

1. Cron job (diariamente a las 9 AM)
2. Obtener clientes con cumpleaños hoy
3. Generar oferta personalizada
4. Enviar vía WhatsApp/Email
5. Registrar notificación

### Paso 4.4: Configurar Credenciales en n8n

- [ ] Supabase credentials
- [ ] WhatsApp/Evolution API credentials
- [ ] HTTP headers con autenticación
- [ ] Variables de entorno para endpoints

---

## 📊 FASE 5: POWER BI (Semana 5)

### Paso 5.1: Conectar Supabase a Power BI

1. Abrir Power BI Desktop
2. Obtener datos → PostgreSQL
3. Ingresar credenciales de Supabase
4. Seleccionar tablas necesarias:
   - sales
   - sale_details
   - clients
   - services

### Paso 5.2: Crear Modelo de Datos

- [ ] Establecer relaciones entre tablas
- [ ] Crear medidas calculadas
- [ ] Crear columnas computadas
- [ ] Definir tablas de fecha

### Paso 5.3: Crear Dashboard Operativo

**Visualizaciones:**
- [ ] Ventas por día (línea)
- [ ] Servicios más vendidos (barras)
- [ ] Clientes nuevos (indicador)
- [ ] Ingresos totales (tarjeta)
- [ ] Tasa de pago (indicador)

### Paso 5.4: Crear Dashboard Ejecutivo

**Visualizaciones:**
- [ ] Revenue Total
- [ ] Customer Lifetime Value (CLV)
- [ ] Customer Retention Rate
- [ ] Growth Rate
- [ ] Profit Margin
- [ ] Churn Analysis

---

## ✅ FASE 6: TESTING Y CALIDAD (Semana 6)

### Paso 6.1: Configurar Jest

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Archivo: `jest.config.js`

```javascript
const nextJest = require('next/jest')
const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Paso 6.2: Crear Tests Unitarios

- [ ] Tests de validaciones (Zod)
- [ ] Tests de Server Actions
- [ ] Tests de componentes
- [ ] Tests de hooks
- [ ] Meta: 80% cobertura mínimo

Comando: `npm test -- --coverage`

### Paso 6.3: Crear Tests de Integración

```bash
npm install --save-dev @playwright/test
```

- [ ] Test: Crear cliente
- [ ] Test: Registrar venta
- [ ] Test: Gestionar vehículos
- [ ] Test: Reportes

### Paso 6.4: Configurar SonarQube

```bash
npm install --save-dev sonarqube-scanner

# En CI/CD
sonar-scanner \
  -Dsonar.projectKey=bia-platform \
  -Dsonar.sources=src \
  -Dsonar.host.url=https://sonarqube.com
```

---

## 🚀 FASE 7: DEVOPS Y DESPLIEGUE (Semana 7)

### Paso 7.1: Configurar GitHub

```bash
git init
git add .
git commit -m "Initial commit: BIA Platform architecture"
git branch -M main
git remote add origin https://github.com/tu-usuario/bia-platform.git
git push -u origin main
```

### Paso 7.2: Crear GitHub Actions Workflow

Archivo: `.github/workflows/deploy.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test -- --coverage
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: npx vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Paso 7.3: Configurar Vercel

1. Ir a https://vercel.com
2. Conectar repositorio GitHub
3. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Configurar despliegue automático

### Paso 7.4: Configurar Monitoreo

- [ ] Sentry para error tracking
- [ ] LogRocket para sesiones de usuario
- [ ] Vercel Analytics para rendimiento
- [ ] Datadog para infraestructura

---

## 📋 VERIFICACIÓN FINAL

### Antes de Ir a Producción

- [ ] Ejecutar todos los tests (80%+ cobertura)
- [ ] Validar SonarQube (no critical issues)
- [ ] Revisar seguridad (OWASP Top 10)
- [ ] Pruebas de penetración
- [ ] Load testing
- [ ] Backup strategy validado
- [ ] Disaster recovery plan
- [ ] Documentación completa
- [ ] Capacitación del equipo

---

## 🎯 ESTIMACIONES DE TIEMPO

| Fase | Duración | Recursos |
|------|----------|----------|
| 1. Infraestructura | 3-5 días | 1 DBA Senior |
| 2. Backend | 1 semana | 1-2 Backend devs |
| 3. Frontend | 1-2 semanas | 1-2 Frontend devs |
| 4. Automatizaciones | 4-5 días | 1 Integraciones dev |
| 5. Power BI | 3-4 días | 1 BI analyst |
| 6. Testing | 1 semana | 1 QA engineer |
| 7. DevOps | 3-4 días | 1 DevOps engineer |
| **TOTAL** | **6-8 semanas** | **5-7 personas** |

---

## 💡 TIPS Y MEJORES PRÁCTICAS

1. **Comenzar por FASE 1:** No avanzar sin base de datos validada
2. **Usar Supabase Studio:** Para explorar datos y probar queries
3. **RLS Primero:** Configurar Row Level Security desde el inicio
4. **Testing Temprano:** No dejar testing para el final
5. **Monitoreo:** Configurar logs desde fase 2
6. **Documentación:** Mantenerla actualizada junto con el código
7. **Versionamiento:** Usar semantic versioning (v0.1.0, v0.2.0, etc.)
8. **Backups:** Configurar desde el inicio

---

## 📞 SOPORTE Y REFERENCIAS

**Documentación Oficial:**
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- n8n: https://docs.n8n.io
- Power BI: https://learn.microsoft.com/power-bi

**Archivos de Referencia:**
1. `ARQUITECTURA_DATOS_BIA_PLATFORM.md` - Diseño completo
2. `SQL_SCRIPT_INICIAL_SUPABASE.sql` - Script SQL
3. `GUIA_IMPLEMENTACION_BIA_PLATFORM.md` - Ejemplos código

---

**Versión:** 1.0  
**Fecha:** 2026-06-17  
**Estado:** Listo para implementación  
**Siguiente Revisión:** 2026-07-17 (después de Fase 3)
