# BIA Platform - Arquitectura del Código

## Visión General

BIA Platform usa **Clean Architecture** para separación de responsabilidades y mantenibilidad.

## Estructura Completa

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/             # Módulos de funcionalidad (organizados por dominio)
│   ├── dashboard/
│   ├── clients/
│   ├── vehicles/
│   ├── automations/
│   ├── services/
│   ├── sales/
│   ├── automations-reports/
│   ├── audit/
│   └── notifications/
├── components/           # Componentes UI reutilizables
│   ├── common/           # Header, Footer, Layout
│   └── ui/              # Componentes Shadcn/UI
├── hooks/               # React hooks globales
├── lib/                 # Utilidades y helpers
├── middleware/          # Middleware de Next.js
├── repositories/        # Data Access Layer (Pattern Repository)
│   ├── interfaces/      # Contratos/interfaces
│   └── supabase/        # Implementación Supabase
├── services/            # Servicios globales
├── validators/          # Esquemas Zod compartidos
├── types/               # Tipos TypeScript globales
└── tests/               # Tests (unit, integration, e2e)
    ├── unit/
    ├── integration/
    └── e2e/
```

## Capas de Arquitectura

### 1. **Presentation Layer** (`/features/*/ui/`, `/components/`)
- Componentes React puros
- Manejo de UI y eventos
- Shadcn/UI components
- Props tipadas con TypeScript

### 2. **Application Layer** (`/features/*/services/`)
- Casos de uso y lógica de negocio
- Orquestación de repositorios
- Transformación de datos
- Manejo de errores de negocio

### 3. **Domain Layer** (`/features/*/types/`, `/validators/`)
- Entidades de negocio
- Tipos e interfaces
- Esquemas de validación (Zod)
- Reglas de negocio

### 4. **Infrastructure Layer** (`/repositories/`, `/middleware/`)
- Acceso a datos (Supabase)
- Integración con APIs externas
- Configuración y setup
- Middleware de request/response

## Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ClientCard.tsx` |
| Funciones | camelCase | `createClient()` |
| Hooks | camelCase, prefijo `use` | `useClients()` |
| Tipos | PascalCase | `ClientDTO`, `CreateClientInput` |
| Archivos | kebab-case | `client.service.ts` |
| Variables | camelCase | `clientData` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |

## Flujo de Datos Típico

```
User Action (Click, Form Submit)
        ↓
[UI Component] (features/*/ui/*.tsx)
        ↓
[React Hook] (features/*/hooks/*.ts) - State Management
        ↓
[Service] (features/*/services/*.ts) - Business Logic
        ↓
[Repository] (repositories/supabase/*.ts) - Data Access
        ↓
[External API] (Supabase, n8n, Power BI, etc)
```

## Patrones Utilizados

### 1. Repository Pattern
```typescript
// Interfaz
interface IClientRepository {
  create(data: CreateClientInput): Promise<Client>;
  findById(id: string): Promise<Client>;
  // ...
}

// Implementación
class ClientSupabaseRepository implements IClientRepository {
  // Lógica con Supabase
}
```

### 2. Service Pattern
```typescript
export class ClientService {
  constructor(private clientRepo: IClientRepository) {}
  
  async getAllClients() {
    return this.clientRepo.findAll();
  }
}
```

### 3. Custom Hooks
```typescript
export function useClients() {
  const [clients, setClients] = useState([]);
  const service = new ClientService(repository);
  
  useEffect(() => {
    service.getAllClients().then(setClients);
  }, []);
  
  return { clients };
}
```

### 4. Server Actions (Next.js 13+)
```typescript
'use server'

export async function createClient(formData: FormData) {
  const service = new ClientService(repository);
  return service.create(formData);
}
```

## Importaciones

### ✅ Correcto

```typescript
// Importar desde barrel export (index.ts)
import { ClientService } from '@/features/clients/services';
import { useClients } from '@/features/clients/hooks';
import { Button } from '@/components/ui/button';

// Importar tipos
import type { Client } from '@/features/clients/types';
```

### ❌ Incorrecto

```typescript
// No importar directo de archivos internos
import { ClientService } from '@/features/clients/services/client.service';

// No importar entre features
import { someUtil } from '@/features/clients/utils/helper';
// Usar en su lugar: importar desde validators compartidos
```

## Dependencias

```json
{
  "next": "16.2.9",
  "react": "19.2.7",
  "typescript": "6.0.3",
  "tailwindcss": "4.0.0",
  "@supabase/supabase-js": "2.108.2",
  "zod": "4.4.3",
  "@hookform/react": "latest",
  "@shadcn/ui": "Latest",
  "jest": "30.4.2",
  "typescript-eslint": "latest"
}
```

## Próximas Fases

- **FASE 4**: Integración Supabase
- **FASE 5**: Autenticación (Auth0/Supabase)
- **FASE 6**: Layout y Navigation
- **FASE 7**: Testing
