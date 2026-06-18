# Repositories (Data Access Layer)

Patrón Repository para abstraer el acceso a datos. Implementa el patrón **Data Mapper**.

## Estructura

```
repositories/
├── interfaces/           # Interfaces/contratos de repositorios
│   ├── base.repository.ts
│   ├── client.repository.ts
│   ├── vehicle.repository.ts
│   └── index.ts
├── supabase/             # Implementación con Supabase
│   ├── base.supabase-repository.ts
│   ├── client.supabase-repository.ts
│   ├── vehicle.supabase-repository.ts
│   └── index.ts
└── index.ts              # Exportaciones principales
```

## Patrón Repository

### Interfaz (Contrato)

```typescript
// repositories/interfaces/client.repository.ts
export interface IClientRepository {
  create(data: CreateClientInput): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findAll(pagination: Pagination): Promise<PaginatedResult<Client>>;
  update(id: string, data: UpdateClientInput): Promise<Client>;
  delete(id: string): Promise<void>;
}
```

### Implementación (Supabase)

```typescript
// repositories/supabase/client.supabase-repository.ts
import { IClientRepository } from '../interfaces';

export class ClientSupabaseRepository implements IClientRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateClientInput): Promise<Client> {
    // Lógica de inserción
  }
  // ... resto de métodos
}
```

## Inyección de Dependencias

En `repositories/index.ts`:

```typescript
import { ClientSupabaseRepository } from './supabase';

export const createRepositories = (supabase: SupabaseClient) => ({
  clients: new ClientSupabaseRepository(supabase),
  vehicles: new VehicleSupabaseRepository(supabase),
  // ... más repositorios
});
```

## Uso en Services

```typescript
// features/clients/services/client.service.ts
export class ClientService {
  constructor(private clientRepo: IClientRepository) {}

  async getAllClients(page: number) {
    return this.clientRepo.findAll({ page, limit: 10 });
  }
}
```

## Beneficios

✅ **Desacoplamiento**: Services no conocen sobre Supabase  
✅ **Testabilidad**: Fácil crear mocks de repositorios  
✅ **Mantenibilidad**: Cambiar BD es solo cambiar implementación  
✅ **Reutilización**: Mismo repositorio para múltiples servicios
