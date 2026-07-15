# 🚀 EJECUCIÓN RÁPIDA - BASE CRÍTICA COMPLETA

**Objetivo**: Completar la base de datos BIA Platform en Supabase al 100%  
**Tiempo total**: 1-2 horas  
**Requisitos**: Acceso a Supabase + .env.local con credenciales

---

## 📋 ORDEN DE EJECUCIÓN

### Fase 1️⃣: Preparación (5 min)

```bash
# 1. Abre tu proyecto en VS Code
cd c:\Users\jfura\Desktop\AXYRA - PROYECTOS\AXYRA - MAC

# 2. Verifica que tengas .env.local con:
cat .env.local | grep SUPABASE
```

✅ Deberías ver 3 líneas SUPABASE_URL y KEYS

---

### Fase 2️⃣: Ejecutar SQL en Supabase (45 min)

**Sigue la guía paso a paso:**

📖 [PASO_A_PASO_EJECUTAR_BD.md](PASO_A_PASO_EJECUTAR_BD.md)

**Resumen rápido:**
1. Abre https://supabase.com → tu proyecto
2. Ve a **SQL Editor**
3. Crea un **New Query**
4. Copia cada sección del SQL en orden:
   - Sección 1: Extensiones
   - Sección 2: Enumeraciones
   - Sección 3: Tablas (desde SQL_SCRIPT_INICIAL_SUPABASE.sql)
   - Sección 4: Índices
   - Sección 5: Triggers
   - Sección 6: RLS
   - Sección 7: Vistas
   - Sección 8: Datos demo

✅ Cuando termines, verifica:

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Deberías ver ~18 tablas.

---

### Fase 3️⃣: Crear Datos Demo (30 min)

**Archivo**: [FIXTURES_DATA_DEMO.sql](FIXTURES_DATA_DEMO.sql)

**Pasos:**

1. **Obtén los UUIDs necesarios:**
   - Sigue: [GUIA_OBTENER_UUIDS.md](GUIA_OBTENER_UUIDS.md)
   - Este archivo te dice exactamente qué queries ejecutar para obtener cada UUID

2. **Reemplaza placeholders en FIXTURES_DATA_DEMO.sql:**
   - Abre FIXTURES_DATA_DEMO.sql
   - Usa Find & Replace (`Ctrl+F`) para reemplazar:
     - `'COMPANY_UUID_AQUI'` → tu company_id real
     - `'STATUS_NUEVO_ID'` → id del estado "Nuevo"
     - `'ADMIN_USER_ID'` → id del usuario admin
     - Etc. (ver tabla en GUIA_OBTENER_UUIDS.md)

3. **Ejecuta en Supabase SQL Editor:**
   - Copia cada parte de FIXTURES_DATA_DEMO.sql
   - Ejecuta en orden (Paso 1 → Paso 11)

✅ Cuando termines, verifica:

```sql
-- En Supabase SQL Editor:
SELECT COUNT(*) as total_clientes FROM clients;
SELECT COUNT(*) as total_ventas FROM sales;
```

Deberías ver clientes y ventas creados.

---

### Fase 4️⃣: Verificar RLS Funciona (10 min)

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'clients', 'sales', 'vehicles', 'audit_logs')
ORDER BY tablename;
```

✅ Deberías ver `rowsecurity = true` en todas

---

### Fase 5️⃣: Probar Desde Next.js (15 min)

Ahora que la BD está completa, vamos a conectarla con el frontend.

1. **Abre tu Next.js en terminal:**

```bash
npm run dev
```

2. **Prueba GET en tu navegador:**

```
http://localhost:3000/api/clients
```

Deberías ver un JSON con tus clientes (si el RLS está configurado correctamente).

3. **Si hay error 403 o lista vacía:**
   - Es porque el JWT no tiene `company_id` seteado
   - Vamos a arreglarlo en la Fase 6

---

### Fase 6️⃣: Configurar Middleware de Company ID (20 min)

**Archivo a editar:** `src/middleware.ts`

Agrega esto para pasar `company_id` al RLS:

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

  if (session?.user) {
    // Obtén el company_id del usuario desde la BD
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', session.user.id)
      .single();

    if (userData?.company_id) {
      // Pasa company_id como variable de sesión para RLS
      response.headers.set('app.current_company_id', userData.company_id);
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

---

### Fase 7️⃣: Verificación Final ✅

Ejecuta este checklist:

```sql
-- 1. ¿Existen todas las tablas?
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Resultado esperado: 18

-- 2. ¿RLS está habilitado?
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Resultado esperado: 16

-- 3. ¿Hay datos demo?
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM sales;

-- 4. ¿Los índices están creados?
SELECT COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public' AND tablename IN ('clients', 'sales', 'users');
-- Resultado esperado: >20

-- 5. ¿Los triggers funcionan?
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_schema = 'public';
-- Resultado esperado: >10
```

---

## 📁 Archivos Clave (En Orden)

| # | Archivo | Propósito | Acción |
|---|---------|----------|--------|
| 1 | [SQL_SCRIPT_INICIAL_SUPABASE.sql](SQL_SCRIPT_INICIAL_SUPABASE.sql) | Script SQL completo (18 tablas) | Copiar en Supabase |
| 2 | [PASO_A_PASO_EJECUTAR_BD.md](PASO_A_PASO_EJECUTAR_BD.md) | Guía detallada de ejecución | Leer y seguir |
| 3 | [FIXTURES_DATA_DEMO.sql](FIXTURES_DATA_DEMO.sql) | Crear datos de prueba | Copiar + reemplazar UUIDs |
| 4 | [GUIA_OBTENER_UUIDS.md](GUIA_OBTENER_UUIDS.md) | Cómo obtener UUIDs necesarios | Usar para PASO 3 |

---

## ⏱️ Timeline Realista

| Fase | Tiempo | Status |
|------|--------|--------|
| Preparación | 5 min | ⏳ |
| SQL Supabase | 45 min | ⏳ |
| Fixtures | 30 min | ⏳ |
| Verificación | 10 min | ⏳ |
| Next.js Config | 20 min | ⏳ |
| **TOTAL** | **110 min (1h50m)** | ⏳ |

---

## 🎯 Resultado Final (Si todo va bien)

✅ Base de datos BIA Platform completamente implementada:
- 18 tablas creadas
- RLS habilitado y configurado
- Triggers de auditoría funcionando
- Índices optimizados
- Datos demo creados
- Next.js conectado y funcionando
- Listo para CRUD de clientes, ventas, etc.

---

## 🚨 Si Algo Falla

### Error: "Table already exists"
→ Normal, significa que ejecutaste el script antes. Es seguro continuar.

### Error: "Permission denied"
→ Usaste la ANON_KEY. Usa SUPABASE_SERVICE_ROLE_KEY en lugar de ANON_KEY para operaciones admin.

### Error: "RLS policy returns false"
→ El JWT no tiene company_id. Sigue Fase 6 de nuevo.

### Error: "Column doesn't exist"
→ Probablemente olvidaste ejecutar una sección. Verifica todos los PASOSdel SQL.

---

## ✅ COMIENZA AHORA

**Próximo paso:**

1. Abre Supabase.com y ve a tu proyecto
2. Abre SQL Editor
3. Sigue [PASO_A_PASO_EJECUTAR_BD.md](PASO_A_PASO_EJECUTAR_BD.md)

**Tiempo estimado hasta tener BD lista: 1 hora**

---

¿Preguntas o atascado? Dimelo y lo arreglamos.

Good luck! 🚀
