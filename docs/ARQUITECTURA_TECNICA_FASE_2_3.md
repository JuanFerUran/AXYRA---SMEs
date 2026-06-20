# Arquitectura Técnica - Fase 2 & 3 BIA Platform

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente (Next.js)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Frontend (React)                       │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │   Pages     │  │ Components   │  │ Animations     │  │ │
│  │  │             │  │ (Framer      │  │ (Motion)       │  │ │
│  │  │ - Dashboard │  │  Motion)     │  │                │  │ │
│  │  │ - Clients   │  │              │  │ - Fade         │  │ │
│  │  │ - Orders    │  │ - Cards      │  │ - Slide        │  │ │
│  │  │ - Analytics │  │ - Forms      │  │ - Zoom         │  │ │
│  │  │             │  │ - Tables     │  │ - Stagger      │  │ │
│  │  │             │  │ - Charts     │  │                │  │ │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Lógica de Negocio                         │ │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │ Hooks          │  │ Services     │  │ Validators   │  │ │
│  │  │                │  │              │  │              │  │ │
│  │  │ - useClients   │  │ - Client     │  │ - Zod        │  │ │
│  │  │ - useAuth      │  │ - Orders     │  │ - Custom     │  │ │
│  │  │ - useData      │  │ - Analytics  │  │              │  │ │
│  │  │                │  │              │  │              │  │ │
│  │  └────────────────┘  └──────────────┘  └──────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Capa de Datos & Repositorio                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  IClientRepository (Interface)                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ ClientSupabaseRepository (Implementation)            │ │ │
│  │  │                                                      │ │ │
│  │  │ - find(id)                                          │ │ │
│  │  │ - findAll(filters)                                  │ │ │
│  │  │ - create(data)                                      │ │ │
│  │  │ - update(id, data)                                  │ │ │
│  │  │ - delete(id)                                        │ │ │
│  │  │ - search(query)                                     │ │ │
│  │  │ - getStats()                                        │ │ │
│  │  │ + más operaciones...                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                       │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Tables:                                              │ │ │
│  │  │ - companies                                          │ │ │
│  │  │ - clients (+ relaciones)                            │ │ │
│  │  │ - client_status                                      │ │ │
│  │  │ - vehicles                                           │ │ │
│  │  │ - sales                                              │ │ │
│  │  │ - (otras tablas según arquitectura)                 │ │ │
│  │  │                                                      │ │ │
│  │  │ Indexes: Para búsqueda rápida                        │ │ │
│  │  │ RLS: Row Level Security por empresa                 │ │ │
│  │  │ Triggers: Auditoría automática                       │ │ │
│  │  │ Functions (RPC): Operaciones complejas              │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Auth                                                      │ │
│  │  - Email/Password                                         │ │
│  │  - OAuth (Google, GitHub)                                │ │
│  │  - Sessions                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Storage (Buckets)                                         │ │
│  │  - avatars (público)                                      │ │
│  │  - documents (privado)                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Carpetas

```
src/
├── app/                              # Next.js App Router
│   ├── dashboard/                    # Rutas protegidas
│   │   ├── page.tsx                 # Dashboard principal
│   │   ├── layout.tsx               # Layout con sidebar
│   │   ├── clients/
│   │   │   └── page.tsx             # Gestión de clientes
│   │   ├── orders/
│   │   │   └── page.tsx             # (Por implementar)
│   │   └── analytics/
│   │       └── page.tsx             # (Por implementar)
│   ├── api/                          # API Routes
│   │   └── clients/
│   │       └── route.ts             # CRUD de clientes
│   ├── auth/
│   │   └── (por implementar)
│   ├── globals.css                   # Estilos globales
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home
│
├── components/                       # Componentes reutilizables
│   ├── animations/                   # Componentes animados
│   │   ├── motion.tsx               # Wrappers de Framer Motion
│   │   ├── animated-cards.tsx       # Cards y Stats
│   │   ├── animated-form.tsx        # Formularios
│   │   ├── animated-chart.tsx       # Gráficos
│   │   ├── data-table.tsx           # Tablas avanzadas
│   │   └── index.ts                 # Barrel export
│   ├── common/                       # Componentes comunes
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── ui/                           # Componentes UI base
│
├── features/                         # Features/módulos
│   ├── clients/
│   │   ├── types/
│   │   │   └── client.ts            # Tipos de datos
│   │   ├── services/
│   │   │   └── client.service.ts    # Lógica de negocio
│   │   ├── hooks/
│   │   │   └── useClients.ts        # Hook personalizado
│   │   ├── ui/
│   │   │   ├── client-card.tsx      # Componentes visuales
│   │   │   └── index.ts             # Barrel export
│   │   ├── validators/
│   │   │   └── client.validators.ts
│   │   └── repositories/             # Implementaciones
│   │
│   ├── orders/                       # (Por implementar)
│   ├── automations/                  # (Por implementar)
│   ├── analytics/                    # (Por implementar)
│   └── ...
│
├── repositories/                     # Data Access Layer
│   ├── interfaces/
│   │   ├── client.repository.ts      # Contrato
│   │   └── ...
│   └── supabase/
│       ├── client.supabase-repository.ts
│       └── ...
│
├── lib/                              # Utilidades
│   ├── supabaseClient.ts            # Instancia de Supabase
│   ├── utils.ts                     # Funciones útiles
│   └── design-system.ts             # Variables de diseño
│
├── hooks/                            # Hooks globales
│   └── use-mobile.ts                # Responsive hook
│
├── types/                            # Tipos globales
├── validators/                       # Validadores globales
├── middleware/                       # Middleware de Next.js
├── actions/                          # Server Actions
├── styles/                           # Estilos globales
└── index.ts                          # Exports principales
```

---

## 🔄 Flujo de Datos

### Ejemplo: Listar Clientes

```
User Interface (ClientList component)
        ↓
useClients Hook
        ↓
ClientService.list(filters)
        ↓
ClientSupabaseRepository.findAll(filters)
        ↓
Supabase API
        ↓
PostgreSQL Query
        ↓
RLS Policy Check
        ↓
Data Response
        ↓
Transform to ClientWithRelations
        ↓
Update Component State
        ↓
Render with Animations (Framer Motion)
```

---

## 🎨 Sistema de Animaciones

### Niveles de Animación

1. **Motion Wrappers** - Componentes base reutilizables
   ```tsx
   MotionContainer → Orchestrates staggered animations
   MotionItem → Individual item animation
   MotionSlideIn → Slide from left/right
   MotionFadeIn → Fade effect
   MotionScaleIn → Zoom effect
   ```

2. **Component Animations** - Lógica integrada
   ```tsx
   AnimatedCard → With hover scale
   DataTable → Staggered rows
   AnimatedForm → Field animations
   AnimatedChart → Chart animations
   ```

3. **Page Animations** - Transiciones entre páginas
   ```tsx
   containerVariants → Container orchestration
   itemVariants → Stagger children
   pageVariants → Page transitions
   ```

---

## 🔐 Seguridad

### Authentication Flow
```
Login (email/password o OAuth)
        ↓
Supabase Auth
        ↓
Session Token (JWT)
        ↓
Stored in client (secure cookie)
        ↓
Attached to requests
        ↓
Backend validates
```

### Data Access Control
- **RLS Policies**: Basadas en `user_id` y `company_id`
- **Row Level Security**: Cada fila controlada por policy
- **Service Role**: Solo para operaciones administrativas
- **Anon Key**: Para usuarios no autenticados (limitado)

---

## 📊 Rendimiento

### Optimizaciones Implementadas

1. **Lazy Loading**
   - Components con React.lazy
   - Routes con dynamic imports

2. **Caching**
   - Datos en hooks (useClients)
   - Cache de Supabase
   - Browser cache

3. **Animations**
   - Hardware accelerated (transform, opacity)
   - `will-change` CSS donde aplica
   - Durations optimizadas (300-800ms)

4. **Bundle Size**
   - Tree-shaking de imports
   - Recharts solo componentes necesarios
   - Framer Motion para solo lo que se usa

---

## 🧪 Testing

### Estructura de Tests (Por Implementar)
```
tests/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── features/
│   └── api/
└── e2e/
    └── features/
```

---

## 🚀 Despliegue

### Tecnologías
- **Frontend**: Next.js 16 → Vercel/Netlify
- **Backend**: Supabase (PaaS)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Automations**: n8n (futura integración)

### Environments
```
Development (localhost:3000)
        ↓
Staging (staging.example.com)
        ↓
Production (app.example.com)
```

---

## 📈 Escalabilidad

### Características de Escalabilidad

1. **Multi-tenant**
   - Cada cliente en tabla `companies`
   - RLS por empresa
   - Datos aislados

2. **Database Scaling**
   - Indexes estratégicos
   - Particionamiento (si es necesario)
   - Connection pooling

3. **Frontend Scaling**
   - Code splitting automático
   - Image optimization
   - CSS-in-JS minimizado

4. **API Scaling**
   - Rate limiting
   - Pagination en queries
   - Compression

---

## 🔗 Integraciones Futuras

1. **n8n**: Automaciones complejas
2. **SendGrid**: Email transaccional
3. **Twilio**: SMS/WhatsApp
4. **Stripe**: Pagos
5. **Analytics**: Posthog/Mixpanel
6. **Error Tracking**: Sentry

---

## 📚 Dependencias Clave

```json
{
  "next": "^16.2.9",
  "react": "^19.2.7",
  "framer-motion": "^11.0.3",
  "react-hook-form": "^7.48.0",
  "zod": "^4.4.3",
  "@supabase/supabase-js": "^2.108.2",
  "recharts": "^2.10.3",
  "tailwindcss": "^3.x",
  "tailwindcss-animate": "^1.0.7",
  "lucide-react": "^1.21.0"
}
```

---

## 🎯 Convenciones de Código

### Naming
- `useXxx` para hooks
- `XxxService` para servicios
- `XxxRepository` para repositorios
- `IXxxRepository` para interfaces

### Estructura de Componentes
```tsx
'use client'; // Si es client component

// Imports
import { motion } from 'framer-motion';

// Types
interface Props {}

// Component
export function Component(props: Props) {
  return <motion.div>...</motion.div>;
}
```

### State Management
- Local state con `useState`
- Global state si es necesario (Zustand/Jotai en futuro)
- Server state con SWR/React Query (futuro)

---

## 📋 Checklist de Implementación

**Fase 2: Backend** ✅
- [x] Tipos de datos
- [x] Services
- [x] Repositories
- [x] Hooks
- [x] Validators

**Fase 3: Frontend** ✅
- [x] Componentes animados
- [x] Páginas principales
- [x] Dashboard
- [x] Gestión de clientes
- [x] Layout

**Fase 4: Integración** ⏳
- [ ] API endpoints
- [ ] Auth
- [ ] RLS policies
- [ ] Automations (n8n)

**Fase 5: Productivo** ⏳
- [ ] Testing
- [ ] Performance
- [ ] Security
- [ ] Deployment

---

Este documento será actualizado según avance el proyecto.
