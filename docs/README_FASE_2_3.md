# 🚀 BIA Platform - Fase 2 & 3 (Completo)

## ¡Bienvenido! 

La **Fase 2 y 3** de la BIA Platform está completamente implementada con:
✨ Animaciones premium con Framer Motion
🎨 Componentes UI avanzados y reutilizables
📊 Gráficos interactivos con Recharts
🎯 Gestión completa de clientes
📱 Diseño totalmente responsive

---

## 🚦 Quick Start

### 1. Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

O si tienes problemas:

```bash
# Limpiar node_modules
rm -r node_modules
rm package-lock.json

# Reinstalar
npm install --legacy-peer-deps
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Levantar el Servidor

```bash
npm run dev
```

Luego abre: **http://localhost:3000/dashboard**

---

## 📁 Estructura del Proyecto

### Componentes de Animación (`src/components/animations/`)
- `motion.tsx` - Wrappers de Framer Motion reutilizables
- `animated-cards.tsx` - Cards animadas (AnimatedCard, StatCard, GradientCard)
- `data-table.tsx` - Tabla avanzada con sorting
- `animated-form.tsx` - Formulario con validación
- `animated-chart.tsx` - Gráficos interactivos

### Gestión de Clientes (`src/features/clients/`)
```
clients/
├── types/
│   └── client.ts          # Tipos completos con todas las propiedades
├── services/
│   └── client.service.ts  # Lógica de negocio
├── hooks/
│   └── useClients.ts      # Hook personalizado
├── ui/
│   └── client-card.tsx    # Componentes visuales
└── validators/
```

### Repositorios (`src/repositories/`)
```
repositories/
├── interfaces/
│   └── client.repository.ts      # Interfaz del repositorio
└── supabase/
    └── client.supabase-repository.ts  # Implementación con Supabase
```

### Páginas (`src/app/`)
```
app/
├── dashboard/
│   ├── page.tsx              # Dashboard principal
│   ├── clients/page.tsx      # Gestión de clientes
│   ├── orders/page.tsx       # (Por implementar)
│   ├── analytics/page.tsx    # (Por implementar)
│   └── layout.tsx            # Layout sidebar + header
└── api/
    └── clients/route.ts      # API de clientes
```

---

## 🎨 Componentes Disponibles

### Motion Components
```tsx
import {
  MotionContainer,
  MotionItem,
  MotionSlideIn,
  MotionFadeIn,
  MotionScaleIn,
} from '@/components/animations';

<MotionContainer>
  <MotionItem>Animated content</MotionItem>
</MotionContainer>
```

### Animated Cards
```tsx
import { AnimatedCard, StatCard, GradientCard } from '@/components/animations';

<StatCard
  title="Total Clients"
  value={150}
  icon={<Users />}
  trend={12}
/>

<GradientCard gradient="blue">
  Premium content
</GradientCard>
```

### Data Table
```tsx
import { DataTable } from '@/components/animations';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
];

<DataTable columns={columns} data={data} />
```

### Animated Chart
```tsx
import { AnimatedChart } from '@/components/animations';

<AnimatedChart
  data={data}
  type="line"
  title="Sales Trend"
/>
```

### Animated Form
```tsx
import { AnimatedForm } from '@/components/animations';

const fields = [
  { name: 'email', label: 'Email', required: true }
];

<AnimatedForm
  fields={fields}
  onSubmit={handleSubmit}
/>
```

### Cliente Components
```tsx
import { ClientCard, ClientList } from '@/features/clients/ui';

<ClientList
  clients={clients}
  onEdit={handleEdit}
  onDelete={handleDelete}
  variant="grid"
/>
```

---

## 🔧 Hooks Disponibles

### useClients
```tsx
import { useClients } from '@/features/clients/hooks/useClients';

const {
  clients,
  isLoading,
  error,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getTopClients,
  getClientStats,
} = useClients({
  filters: { is_active: true },
  autoFetch: true,
});
```

---

## 🎯 Funciones del ClientService

El `ClientService` incluye:

```typescript
// CRUD
list()
get(id)
create(data)
update(id, data)
delete(id)

// Búsqueda & Filtrado
getByEmail(email)
searchClients(query, companyId)
getActiveClients(companyId)
getTopClients(companyId, limit)
getInactiveClients(companyId, days)
getBirthdayClients(companyId, daysAhead)

// Estadísticas
getClientStats(companyId)
exportClients(companyId, format)

// Operaciones en Lote
updateStatus(id, statusId)
bulkUpdateStatus(ids, statusId)
```

---

## 📊 Tipos de Datos

### Client
Incluye todos los campos de tu base de datos:
- Información personal (nombre, email, teléfono, fecha nacimiento)
- Datos comerciales (total compras, lifetime value, última compra)
- Dirección (país, estado, ciudad, código postal)
- Estado y auditoría

### ClientWithRelations
Extiende `Client` con:
- `status` - Información del estado del cliente
- `vehicles_count` - Cantidad de vehículos
- `total_services` - Cantidad de servicios

---

## 🚀 Próximos Pasos

### 1. Modal de Crear/Editar Cliente
```tsx
// Implementar usando AnimatedForm en un modal
```

### 2. API Endpoints
```bash
GET    /api/clients              # Listar
POST   /api/clients              # Crear
GET    /api/clients/[id]         # Obtener
PATCH  /api/clients/[id]         # Actualizar
DELETE /api/clients/[id]         # Eliminar
```

### 3. Funcionalidades Adicionales
- [ ] Página de Órdenes/Ventas
- [ ] Dashboard de Analytics
- [ ] Sistema de Automaciones (n8n)
- [ ] Autenticación (Supabase Auth)
- [ ] Notificaciones (Email/SMS)
- [ ] Dark Mode Theme
- [ ] Real-time Updates

---

## 🎬 Animaciones Incluidas

Todas las páginas incluyen:
- ✨ Fade-in al cargar
- 🎯 Slide-in de elementos
- 📈 Zoom de cards
- 🎨 Gradientes animados
- 🔄 Transiciones suaves
- 🎪 Stagger animations
- 📊 Animaciones de gráficos

---

## 📱 Responsive Design

- Mobile: Optimizado para 320px+
- Tablet: Layouts adaptativos
- Desktop: Sidebar lateral

---

## 🔐 Configuración Necesaria en Supabase

### RLS Policies
Necesitas crear policies RLS para:
- Clientes (lectura/escritura por empresa)
- Vehículos
- Órdenes/Ventas

### Functions (RPC)
```sql
-- find_upcoming_birthdays
-- get_client_stats
-- get_inactive_clients
```

---

## 🛠️ Troubleshooting

### Error: "Module not found"
```bash
npm install --legacy-peer-deps
```

### Error: "Supabase connection"
Verifica `.env.local` con credenciales correctas

### Animaciones lentas
Las animaciones están optimizadas. Si es muy lento:
- Reducir `duration` en motion components
- Usar `ReducedMotion` media query

---

## 📚 Documentación

- [Framer Motion Docs](https://www.framer.com/motion)
- [Recharts Docs](https://recharts.org)
- [Next.js Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)

---

## ✅ Checklist Implementación Completa

**Fase 2: Backend Next.js** ✅
- [x] Tipos de datos completos
- [x] Servicios robustos
- [x] Repositorios con Supabase
- [x] Hooks personalizados
- [x] Validación

**Fase 3: Frontend UI** ✅
- [x] Componentes animados
- [x] Páginas principales
- [x] Dashboard interactivo
- [x] Gestión de clientes
- [x] Responsive design

**Por Implementar**
- [ ] Autenticación
- [ ] Otros módulos (órdenes, automaciones)
- [ ] Admin panel
- [ ] Reportes avanzados

---

¡**La plataforma está lista para despegar! 🚀**

Para preguntas o cambios, contacta al equipo de desarrollo.
