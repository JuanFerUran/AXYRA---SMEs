# Software Architecture Document (SAD)
**Business Intelligence & Automation Platform for SMEs (BIA Platform)**

---

## 1. Arquitectura General

### 1.1. Arquitectura por capas
La plataforma se organiza en 4 capas principales:

1. **Presentation Layer**
   - UI Next.js / Tailwind / Shadcn
   - Componentes visuales, páginas, layouts, server actions y hooks
   - Responsable de UX, interacción de usuario y validación básica de formulario

2. **Application Layer**
   - Casos de uso, services orquestadores, DTOs y orquestación de flujos
   - Responsable de coordinar acciones de negocio entre Domain e Infrastructure

3. **Domain Layer**
   - Entidades, valores de objeto, reglas de negocio puros y servicios de dominio
   - Responsable del core del negocio independiente de tecnología

4. **Infrastructure Layer**
   - Acceso a datos, integración con Supabase, n8n, WhatsApp API, Power BI, logging, email
   - Responsable de detalles técnicos y adaptadores externos

### 1.2. Clean Architecture
Se aplica Clean Architecture con dependencias hacia adentro:
- Presentation depende de Application
- Application depende de Domain
- Domain no depende de nada externo
- Infrastructure implementa interfaces definidas en Application/Domain

### 1.3. Responsabilidades de cada capa

#### Presentation Layer
- Renderizar páginas y componentes
- Recibir eventos del usuario
- Disparar Server Actions y llamadas cliente
- Formular validaciones y mostrar estados
- Manejo de rutas y protección UI

#### Application Layer
- Casos de uso: `CreateClient`, `GenerateReport`, `SendNotification`, `TriggerAutomation`
- Validar reglas de orquestación y flujo
- Convertir datos entre DTOs y entidades
- Llamar repositorios e integraciones
- Manejar errores de dominio y presentación

#### Domain Layer
- Definir entidades: `Client`, `Vehicle`, `ServiceOrder`, `Sale`, `Automation`, `Notification`
- Reglas de negocio: agregados, invariantes y procesos de negocio
- Value Objects: `Email`, `PhoneNumber`, `Money`, `CronSchedule`
- Servicios de dominio puros y clases inmutables

#### Infrastructure Layer
- Implementar repositorios con Supabase
- Clientes de API externa (WhatsApp API, Power BI, n8n)
- Persistencia, cache, env vars, logging
- Conexión entre Application y proveedores externos

---

## 2. Flujo de Datos

### 2.1. Flujo general
```text
Usuario
  ↓
UI (Next.js + Shadcn)
  ↓
Server Action
  ↓
Service / Use Case
  ↓
Repository Interface
  ↓
Supabase / Infraestructura
  ↓
Resultado / Respuesta
  ↓
Server Action
  ↓
UI
```

### 2.2. Diagrama textual detallado
```text
[Usuario] 
   |
   v
[UI / Páginas / Componentes]
   |
   v
[Server Action] --validación Zod--> [Application Service]
   |
   v
[Use Case / Orquestador]
   |
   v
[Domain Entities / Rules]
   |
   v
[Repository Interface]
   |
   v
[Supabase Client / Infra Adapter]
   |
   v
[Base de datos PostgreSQL]
   |
   v
[Data / Entity DTO]
   |
   v
[Service Response]
   |
   v
[Server Action]
   |
   v
[UI / Feedback]
```

### 2.3. Ejemplo de flujo
```text
Usuario hace submit en formulario de cliente
  ↓
Server Action `createClientAction`
  ↓
Application Service `CreateClientService`
  ↓
Valida DTO con Zod
  ↓
Domain Entity `Client`
  ↓
Repository `ClientsRepository.create`
  ↓
Supabase `insert('clients')`
  ↓
Respuesta de Supabase
  ↓
Service normaliza respuesta
  ↓
Server Action retorna estado + mensaje
  ↓
UI muestra confirmación
```

---

## 3. Estructura de Carpetas

### 3.1. Estructura principal
```text
src/
  app/
  components/
  features/
  actions/
  services/
  repositories/
  lib/
  hooks/
  types/
  validators/
  middleware/
  tests/
```

### 3.2. Responsabilidad de cada carpeta

- `src/app/`
  - Rutas de Next.js, layouts, páginas, metadata, interceptores
  - Puntos de entrada de la aplicación

- `src/components/`
  - Componentes reutilizables UI y presentacionales
  - Atómicos / moléculas / templates
  - Basados en Shadcn/UI + Tailwind

- `src/features/`
  - Módulos organizados por dominio funcional
  - Contiene subcarpetas con UI, hooks, casos de uso y modelos por feature

- `src/actions/`
  - Server Actions y handlers de formularios
  - Entry points que exponen acciones del servidor

- `src/services/`
  - Use cases, case services, lógica de orquestación
  - Interfaces de servicio y adaptadores de infraestructura

- `src/repositories/`
  - Interfaces y implementaciones de repositorios
  - Persistencia y acceso a datos

- `src/lib/`
  - Utilidades genéricas, configuración de Supabase, env, helpers
  - Cliente Supabase server / browser, logger, constants

- `src/hooks/`
  - Hooks React / Next.js para la UI
  - `useUser`, `useClient`, `useNotifications`, `useAsync`

- `src/types/`
  - Tipos compartidos, enums, union types, DTOs
  - Tipos globales y domain-only types

- `src/validators/`
  - Esquemas Zod y validaciones compartidas
  - Validadores de input y DTOs

- `src/middleware/`
  - Middlewares de Next.js, autenticación, logging, rate limiting
  - Route handlers y protección

- `src/tests/`
  - Pruebas unitarias, integración y E2E helpers
  - `unit/`, `integration/`, `e2e/`

---

## 4. Organización por Feature

### 4.1. Módulos principales
- `auth`
- `clients`
- `vehicles`
- `services`
- `sales`
- `dashboard`
- `automations`
- `notifications`
- `audit`

### 4.2. Estructura exacta por feature
```text
src/features/
  auth/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  clients/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  vehicles/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  services/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  sales/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  dashboard/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  automations/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  notifications/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
  audit/
    ui/
    hooks/
    services/
    repositories/
    validators/
    types/
```

### 4.3. Nota de organización
- Cada feature agrupa su propia lógica y evita monolitos de carpetas globales.
- La carpeta `ui/` contiene componentes de presentación de feature.
- `services/` dentro de cada feature orquesta casos de uso específicos.

---

## 5. Convenciones de Código

### 5.1. Naming conventions

- `camelCase` para variables, funciones, hooks y props
- `PascalCase` para componentes, clases y tipos
- `UPPER_SNAKE_CASE` para constantes globales
- `kebab-case` para nombres de archivos de rutas y assets cuando sea necesario

### 5.2. Component naming

- Componentes atómicos: `ButtonPrimary`, `CardItem`, `InputText`
- Componentes de feature: `ClientForm`, `VehicleTable`, `SalesChart`
- Evitar sufijos genéricos como `Component` excepto en casos de conflicto
- Preferir nombres descriptivos: `ClientDetailsPanel`

### 5.3. File naming

- `.tsx` para componentes
- `.ts` para lógica, servicios, hooks, repositorios
- Server actions: `createClient.server.ts` o `actions.ts`
- Route handlers: `route.ts`
- Tests: `*.test.ts` / `*.spec.ts`

### 5.4. Type naming

- Tipos genéricos: `Client`, `Vehicle`, `ServiceOrder`, `Sale`
- Enums: `SaleStatus`, `NotificationChannel`
- Value Objects: `EmailVO`, `MoneyVO`, `CronExpressionVO`

### 5.5. Interface naming

- `IClientRepository`
- `IVehicleService`
- `IAutomationEngine`
- `IAuthProvider`
- Interfaces internas opcionales: prefijo `I` solo si mejora claridad

### 5.6. DTO naming

- `CreateClientDto`
- `UpdateVehicleDto`
- `ClientResponseDto`
- `NotificationPayloadDto`
- `AutomationTriggerDto`

---

## 6. Validaciones

### 6.1. Estrategia con Zod + TypeScript
- Definir esquemas Zod en `src/validators/`
- Usar `z.infer<typeof schema>` para tipar DTOs
- Validar inputs en Presentation y Application usando los mismos esquemas
- Separar validación de UI y validación de negocio

### 6.2. Ejemplos

#### `src/validators/client.ts`
```ts
import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email no válido'),
  phone: z.string().min(8, 'Teléfono no válido'),
  companyId: z.string().uuid(),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
```

#### `src/actions/createClient.server.ts`
```ts
import { createClientSchema } from '@/validators/client';
import { createClientService } from '@/services/clients';
import { revalidatePath } from 'next/cache';

export async function createClientAction(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = createClientSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const result = await createClientService(parsed.data);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath('/clients');
  return { success: true };
}
```

### 6.3. Regla de validación
- Zod para validación de contract y shape
- Domain services para reglas de negocio no triviales
- Middleware de servidor para validación de payload en endpoints

---

## 7. Manejo de Errores

### 7.1. Tipos de error
- `ValidationError`
- `DomainError`
- `NotFoundError`
- `UnauthorizedError`
- `ForbiddenError`
- `InfrastructureError`
- `ExternalServiceError`

### 7.2. Error boundaries
- UI:
  - `error.tsx` en rutas `app/` para capturar errores de render
  - Componentes `ErrorBoundary` para partes críticas
- Server:
  - Middleware global para capturar y mapear errores en responses

### 7.3. Logging
- Logger central en `src/lib/logger.ts`
- Niveles: `debug`, `info`, `warn`, `error`
- Registrar:
  - errores de infraestructura
  - respuestas de APIs externas fallidas
  - eventos críticos de automatizaciones
- En producción, integrar con Sentry, Logflare o Datadog

### 7.4. Retroalimentación de usuario
- Mensajes amigables en UI para cada tipo de error
- No exponer detalles internos
- Usar toasts / banners / modales:
  - `Error fetching data`
  - `No autorizado`
  - `Validación fallida: revise los campos`

---

## 8. Seguridad

### 8.1. Middleware
- `middleware.ts` para protección de rutas y redirección
- Verifica token de sesión de Supabase
- Aplica `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`
- Rate limiting para APIs sensibles

### 8.2. Authentication
- Autenticación con Supabase Auth
- Tokens JWT en cookies seguras `HttpOnly`
- Next.js server actions validan sesión server-side
- `useUser()` en cliente para datos de sesión

### 8.3. Authorization
- Roles definidos: `admin`, `manager`, `analyst`, `operator`
- Permisos basados en role + scope:
  - `admin`: full access
  - `manager`: clientes, ventas, dashboard, automatizaciones
  - `analyst`: solo BI y reportes
  - `operator`: notificaciones y servicio en terreno
- Reglas en Application Layer y en Supabase RLS si aplica

### 8.4. Route protection
- Pages protegidas por `middleware`
- Server actions validan sesión antes de ejecutar
- Feature flags y permisos de API

### 8.5. Server-side validation
- Todos los datos entrantes validados server-side
- No confiar en validación del cliente
- Validar:
  - payloads de API
  - datos recibidos desde n8n / webhooks
  - respuestas de terceros

---

## 9. Integración con Supabase

### 9.1. Cliente servidor
- `src/lib/supabaseServer.ts`
- Usar `createClient` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- Solo en server-side, actions y jobs
- Ejemplo:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

### 9.2. Cliente navegador
- `src/lib/supabaseClient.ts`
- Usar `SUPABASE_ANON_KEY`
- Para `useSWR` / hooks y auth en cliente
- Ejemplo:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 9.3. Repositories
- Interfaces en `src/repositories/interfaces/`
- Implementaciones en `src/repositories/supabase/`
- Ejemplo:
  - `IClientRepository`
  - `SupabaseClientRepository`
  - `IVehicleRepository`
  - `SupabaseVehicleRepository`

### 9.4. Queries
- Queries en repositorios con SQL paramétrico o `supabase-js`
- Buenas prácticas:
  - seleccionar columnas explícitas
  - evitar fetch masivo
  - usar `rpc` para lógica compleja
  - usar `eq`, `in`, `like`, `range`
  - paginación y filtros
  - cache en edge / ISR para dashboards

### 9.5. Buenas prácticas
- Usar políticas RLS si se requiere seguridad de datos multi-tenant
- Mantener queries en repositorios y no en UI
- Reutilizar `type` y `schema` con Zod
- Uso de `select` para columnas necesarias
- Mapeo a entidades y DTOs antes de exponer datos
- Crear `src/lib/supabaseHelpers.ts` con wrappers comunes

---

## 10. Integración con n8n

### 10.1. Eventos
- Eventos disparados por acciones de negocio:
  - `new_sale_created`
  - `payment_received`
  - `client_signed_up`
  - `automation_triggered`
  - `notification_failed`
- Publicar eventos a n8n vía webhook o API

### 10.2. Webhooks
- Endpoints dedicados en Next.js:
  - `src/app/api/webhooks/n8n/route.ts`
- Verificar firma/hmac para seguridad
- Mapeo de payloads n8n a DTOs internos
- Ejemplo:
```ts
export async function POST(req: Request) {
  const body = await req.json();
  validateN8nSignature(req, body);
  await automationWebhookHandler(body);
  return new Response(null, { status: 200 });
}
```

### 10.3. Automatizaciones
- n8n se usa como motor de workflow externo
- Flujos típicos:
  - email o WhatsApp tras nueva venta
  - alertas de auditoría
  - refresco de Power BI dataset
  - integración con CRM / ERP
- Arquitectura:
  - Supabase + n8n actúan como eventos / triggers
  - Next.js expone webhooks y publica eventos
  - n8n ejecuta acciones y llama APIs internas cuando se requiere

### 10.4. Arquitectura de integración
```text
[Aplicación BIA] --> [n8n Webhook/evento] --> [n8n]
       ^                                   |
       |                                   v
       +-- [API WhatsApp] <--> [WhatsApp API]
       +-- [Power BI Refresh] <--> [Power BI]
       +-- [Supabase] <--> [DB / Auth]
```

---

## 11. Estrategia de Testing

### 11.1. Unit Testing
- Herramienta: `Jest`
- Cobertura:
  - Domain entities
  - Value Objects
  - Use cases
  - Utils y validaciones
- Ubicación: `src/tests/unit/`

### 11.2. Integration Testing
- Herramienta: `Testing Library` + `Jest`
- Cobertura:
  - Repositories con Supabase local / test
  - Servicios de aplicación
  - Endpoints de API
- Ubicación: `src/tests/integration/`

### 11.3. E2E Testing
- Herramienta: `Playwright`
- Cobertura:
  - flujo de autenticación
  - creación de cliente
  - creación de venta
  - ejecución de automatización
  - visualización de dashboard
- Ubicación: `src/tests/e2e/`

### 11.4. Estructura de carpetas de tests
```text
src/tests/
  unit/
    domain/
    services/
    repositories/
  integration/
    api/
    repositories/
    services/
  e2e/
    auth.spec.ts
    clients.spec.ts
    sales.spec.ts
    dashboard.spec.ts
```

### 11.5. Prácticas
- `arrange-act-assert`
- mocks para infra externa
- evitar tests frágiles de UI
- usar datos de prueba consistentes
- separar test de configuración y test de lógica

---

## 12. CI/CD

### 12.1. Flujo
```text
GitHub
  ↓
GitHub Actions
  ↓
Tests (Jest + Playwright)
  ↓
Build (Next.js)
  ↓
Deploy
  ↓
Vercel
```

### 12.2. Pipeline sugerido
1. `push` / `pull_request`
2. Instalar dependencias
3. Ejecutar lint
4. Ejecutar unit + integration tests
5. Ejecutar build de Next.js
6. Ejecutar E2E en rama principal o release
7. Deploy a Vercel en `main`
8. Notificar resultado

### 12.3. GitHub Actions
- `ci.yml`
  - jobs: `lint`, `test`, `build`
- `deploy.yml`
  - job: `vercel-deploy` (o integrado con Vercel)
- Opcional: `security.yml` para dependabot / scanning

### 12.4. Buenas prácticas
- Separar pipeline por `pull request` y `deploy`
- Build en entorno limpio
- Caching de node_modules
- Variables secretas en GitHub y Vercel
- Probar rollback en Vercel si falla deploy

---

## 13. Roadmap Técnico

### 13.1. Módulo 1: Fundamentos
- Configuración inicial de Next.js + TypeScript + Tailwind + Shadcn
- Configuración de Supabase (Auth + DB)
- Estructura de carpetas y arquitecturas
- Implementación de `auth` básica y middleware
- Setup de CI/CD básico

### 13.2. Módulo 2: Core Clientes y Vehículos
- CRUD de `clients`
- CRUD de `vehicles`
- Repositorios Supabase
- Server Actions y UI de formularios
- Validaciones Zod

### 13.3. Módulo 3: Servicios y Ventas
- `services` y `sales`
- Registro de órdenes y ventas
- Dashboard inicial de métricas
- Reportes básicos

### 13.4. Módulo 4: Notificaciones y Auditoría
- Integración de `notifications`
- Setup de `audit` logs
- Historial de eventos y actividades
- Envío de notificaciones internas

### 13.5. Módulo 5: Automatizaciones
- Integración inicial con n8n
- Webhooks y eventos
- Automatización de notificaciones
- Flujos de servicio y ventas

### 13.6. Módulo 6: BI y Reportes Avanzados
- Integración con Power BI
- Actualización de datasets
- Dashboards operativos y KPI
- Export y refresh de datos

### 13.7. Módulo 7: Seguridad y Roles
- Implementación completa de roles
- Protección de rutas
- RLS / políticas Supabase si es necesario
- Auditoría de accesos

### 13.8. Módulo 8: Escalado y Operaciones
- Optimización de consultas
- Logging avanzado
- Monitoreo y alertas
- Documentación de APIs y procesos

---

## 14. Decisiones Arquitectónicas

### 14.1. Por qué usar Next.js
- Excelente para apps SaaS con SSR/ISR híbrido
- Server Actions simplifican lógica server-side
- Integración nativa con Vercel
- Buen soporte para rutas, middleware y performance

### 14.2. Por qué usar Server Actions
- Reduce la necesidad de API REST custom
- Maneja validación y lógica desde el servidor
- Mejor experiencia de desarrollo con formularios de Server Components
- Separa UI de lógica sin API duplicada

### 14.3. Por qué usar Supabase
- PostgreSQL completamente gestionado
- Auth, storage y funciones integradas
- Rápido prototipo + escalabilidad
- Compatible con SQL y políticas RLS

### 14.4. Por qué usar n8n
- Orquestación visual de automatizaciones
- Fácil integración con webhooks y APIs
- Permite a no-desarrolladores configurar flujos
- Buena opción para IA de negocio sin construir un motor propio

### 14.5. Por qué Power BI
- Herramienta BI empresarial estándar
- Permite dashboards avanzados y análisis de datos
- Integración con datos de Supabase / PostgreSQL
- Ideal para SMEs que necesitan reportes visuales y KPI

### 14.6. Ventajas y limitaciones

- Ventajas
  - Arquitectura modular y preparada para escalado
  - Clean Architecture facilita mantenimiento
  - Next.js + Supabase acelera tiempo de entrega
  - n8n reduce complejidad de automatizaciones
  - Power BI agrega valor BI sin reinventar visualización

- Limitaciones
  - Server Actions aún son relativamente nuevas; revisar compatibilidad
  - n8n introduce dependencia externa y necesita monitoring
  - Power BI puede requerir licencias y configuración adicional
  - Supabase service role key debe manejarse con cuidado

---

## 15. Conclusión

Este documento entrega el diseño técnico completo para iniciar la implementación del proyecto en VS Code sin decisiones arquitectónicas adicionales. La estructura propuesta, los flujos de datos, la integración con Supabase/n8n/Power BI y las prácticas de testing/CI/CD permiten arrancar con un MVP robusto y escalable.
