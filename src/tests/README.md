# Testing

Estrategia de testing para asegurar calidad de código.

## Estructura

```
tests/
├── unit/           # Tests unitarios (funciones, servicios, validadores)
│   ├── services/
│   ├── validators/
│   ├── repositories/
│   └── hooks/
├── integration/    # Tests de integración (Feature completa)
│   ├── clients.integration.test.ts
│   ├── vehicles.integration.test.ts
│   └── automations.integration.test.ts
└── e2e/           # Tests end-to-end (Flujos de usuario completos)
    ├── auth.e2e.test.ts
    ├── client-management.e2e.test.ts
    └── order-creation.e2e.test.ts
```

## Unit Tests (Jest)

Pruebas de funciones individuales, servicios y lógica.

```typescript
// tests/unit/services/client.service.test.ts
import { ClientService } from '@/features/clients/services';

describe('ClientService', () => {
  it('should create a client with valid data', () => {
    // Test implementation
  });
});
```

## Integration Tests

Pruebas de múltiples capas juntas (Service + Repository + DB).

```typescript
// tests/integration/clients.integration.test.ts
describe('Client Management Feature', () => {
  it('should create and retrieve a client', async () => {
    // Setup
    // Execute
    // Assert
  });
});
```

## E2E Tests (Playwright/Cypress)

Pruebas de flujos completos desde UI hasta BD.

```typescript
// tests/e2e/client-management.e2e.test.ts
test('User can create and edit a client', async ({ page }) => {
  await page.goto('/clients');
  await page.click('text=New Client');
  // ... llenar formulario
  await page.click('text=Save');
  // ... assertions
});
```

## Cobertura Mínima

- Unit Tests: 80% de funciones críticas
- Integration Tests: 60% de features principales
- E2E Tests: 30% de flujos críticos de usuario

## Ejecución

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```
