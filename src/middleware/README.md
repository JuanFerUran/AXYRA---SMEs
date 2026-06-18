# Middleware

Middleware para procesamiento de requests/responses globales.

## Estructura

```
middleware/
├── auth.middleware.ts      # Autenticación y autorización
├── error.middleware.ts     # Manejo centralizado de errores
├── logging.middleware.ts   # Logging de requests
├── rate-limit.middleware.ts # Rate limiting
└── index.ts               # Exportaciones
```

## Middleware de Next.js

En `middleware.ts` (raíz de `src/`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/auth.middleware';

export async function middleware(request: NextRequest) {
  // Verificar autenticación
  const auth = await authMiddleware(request);
  if (!auth.valid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/api/:path*',
  ],
};
```

## Autenticación

Verifica JWT token y valida sesión de usuario.

## Rate Limiting

Previene abuso limita requests por IP/usuario.

## Logging

Registra información de requests para auditoría.

## Error Handling

Captura y formatea errores globalmente.
