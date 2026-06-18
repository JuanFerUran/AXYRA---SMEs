# Features Architecture

Esta carpeta contiene todas las features (módulos de funcionalidad) de la BIA Platform, organizadas siguiendo **Clean Architecture**.

## Estructura de una Feature

Cada feature tiene la siguiente estructura:

```
feature-name/
├── ui/               # Componentes de presentación (React/Shadcn)
├── services/         # Lógica de negocio y casos de uso
├── repositories/     # Acceso a datos (abstracción)
├── validators/       # Esquemas Zod para validación
├── types/            # Tipos e interfaces específicas de la feature
└── hooks/            # React hooks personalizados
```

## Features Principales

### Dashboard (`src/features/dashboard/`)
**Responsabilidad**: Panel de control principal con KPIs y métricas del negocio
- Visualización de estadísticas en tiempo real
- Gráficos de tendencias
- Tarjetas resumen de módulos

### Clients (`src/features/clients/`)
**Responsabilidad**: Gestión de clientes
- CRUD de clientes
- Búsqueda y filtrado
- Asignación de vehículos
- Historial de interacciones

### Vehicles (`src/features/vehicles/`)
**Responsabilidad**: Gestión de vehículos
- CRUD de vehículos
- Tracking de GPS
- Mantenimiento y historial
- Asignación a clientes

### Automations (`src/features/automations/`)
**Responsabilidad**: Integración con n8n
- Creación y gestión de workflows
- Ejecución de automatizaciones
- Logs de ejecución
- Configuración de triggers

### Services (`src/features/services/`)
**Responsabilidad**: Gestión de servicios
- Catálogo de servicios
- Pricing y planes
- Disponibilidad

### Sales (`src/features/sales/`)
**Responsabilidad**: Gestión de ventas y pedidos
- Creación de órdenes
- Seguimiento de estado
- Cálculo de precios
- Historial de transacciones

### Automations Reports (`src/features/automations-reports/`)
**Responsabilidad**: Reportes inteligentes con Power BI
- Integración con Power BI
- Reportes personalizados
- Exportación de datos
- Programación de reportes

### Audit (`src/features/audit/`)
**Responsabilidad**: Auditoría y seguridad
- Log de actividades
- Cambios en registros
- Acceso a datos
- Cumplimiento regulatorio

### Notifications (`src/features/notifications/`)
**Responsabilidad**: Sistema de notificaciones
- Email
- SMS
- In-app
- Preferencias de usuario

## Flujo de Datos (Clean Architecture)

```
UI (Components) → Services (Business Logic) → Repositories (Data Access) → External APIs/DB
                 ↓
            Validators (Zod)
            Types (Interfaces)
            Hooks (State Management)
```

## Convenciones

- **Componentes**: PascalCase, ubicados en `ui/`
- **Funciones**: camelCase
- **Tipos**: PascalCase en `types/`
- **Validators**: Zod schemas en `validators/`
- **Servicios**: Contienen lógica de negocio
- **Repositories**: Abstraen acceso a datos

## Importaciones

```typescript
// ✅ Correcto: Importar desde la feature específica
import { useClients } from '@/features/clients/hooks';
import { ClientService } from '@/features/clients/services';

// ❌ Evitar: Acceso directo a carpetas internas
import { ClientService } from '@/features/clients/services/client.service';
```

Siempre usa `index.ts` como punto de entrada (barrel export).
