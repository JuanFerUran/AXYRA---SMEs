# Validators

Esquemas Zod compartidos para validación de datos en toda la aplicación.

## Estructura

```
validators/
├── auth.validators.ts          # Esquemas de autenticación
├── pagination.validators.ts    # Esquemas de paginación
├── common.validators.ts        # Esquemas comunes (IDs, emails, etc)
└── index.ts                    # Exportaciones
```

## Ejemplo de Uso

```typescript
import { createClientSchema, updateClientSchema } from '@/validators';
import type { CreateClientInput } from '@/validators';

// Validar datos
const parsed = createClientSchema.safeParse(formData);
if (!parsed.success) {
  // Manejar errores
}
```

## Convenciones

- Usa `.safeParse()` para no lanzar excepciones
- Convierte tipos TypeScript con `z.infer<typeof schema>`
- Reutiliza esquemas base: `z.object({...baseSchema.pick()})`
- Naming: `{action}{Entity}Schema` (ej: `createClientSchema`)
