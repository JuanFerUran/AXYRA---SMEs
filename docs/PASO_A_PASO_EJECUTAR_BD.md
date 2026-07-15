# 📋 Paso a Paso: Ejecutar Base de Datos en Supabase

**Objetivo**: Completar la base de datos del proyecto en Supabase  
**Tiempo estimado**: 30-45 minutos  
**Requisitos**: Acceso a Supabase, .env.local con credenciales  

---

## ✅ PASO 1: Verificar Credenciales (2 min)

Abre tu archivo `.env.local` y confirma que tienes:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxx
```

---

## ✅ PASO 2: Ir a Supabase SQL Editor (2 min)

1. Abre https://supabase.com y loguéate
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú izquierdo
4. Haz clic en **New Query**

---

## ✅ PASO 3: EJECUTAR SCRIPT POR SECCIONES (30 min)

**⚠️ IMPORTANTE**: Ejecuta cada sección en el orden que aparece. NO ejecutes el script completo de una vez.

### 📌 Sección 1: Extensiones (1 min)

Copia y ejecuta SOLO esto:

```sql
-- ============================================================================
-- PASO 1: EXTENSIONES REQUERIDAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

✅ Espera a que termine (debe decir "Success" o similar)

---

### 📌 Sección 2: Enumeraciones (2 min)

Copia y ejecuta SOLO esto:

```sql
-- ============================================================================
-- PASO 2: ENUMERACIONES Y TIPOS CUSTOMIZADOS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider_type') THEN
    CREATE TYPE auth_provider_type AS ENUM ('supabase', 'google', 'microsoft');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_gender') THEN
    CREATE TYPE client_gender AS ENUM ('M', 'F', 'O', 'N');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('DNI', 'RUT', 'CÉDULA', 'PASAPORTE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_preference') THEN
    CREATE TYPE contact_preference AS ENUM ('email', 'whatsapp', 'phone');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'truck', 'van', 'motorcycle');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
    CREATE TYPE fuel_type AS ENUM ('gasolina', 'diesel', 'hybrid', 'eléctrico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed', 'loyalty');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'partial', 'refunded');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
    CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'transfer', 'check');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_type') THEN
    CREATE TYPE workflow_type AS ENUM ('welcome', 'recovery', 'promotion', 'birthday', 'custom');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trigger_type') THEN
    CREATE TYPE trigger_type AS ENUM ('client_created', 'inactivity', 'sales_milestone', 'birthday', 'manual');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('welcome', 'recovery', 'promotion', 'birthday', 'manual');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM ('whatsapp', 'email', 'sms');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('sent', 'delivered', 'read', 'failed', 'bounced');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'execution_status') THEN
    CREATE TYPE execution_status AS ENUM ('pending', 'success', 'failed', 'retrying');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_type') THEN
    CREATE TYPE audit_action_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_name_type') THEN
    CREATE TYPE role_name_type AS ENUM ('admin', 'employee', 'manager');
  END IF;
END;
$$ LANGUAGE plpgsql;
```

✅ Ejecuta y espera

---

### 📌 Sección 3: Tablas Principales (10 min)

Abre el archivo `/docs/SQL_SCRIPT_INICIAL_SUPABASE.sql` y copia desde el comentario:

```
-- ============================================================================
-- PASO 3: TABLAS PRINCIPALES
-- ============================================================================
```

Hasta:

```
-- ============================================================================
-- PASO 4: ÍNDICES
-- ============================================================================
```

**⚠️ NO incluyas el comentario "PASO 4"**

Pega y ejecuta. ✅

---

### 📌 Sección 4: Índices (3 min)

Copia desde `-- PASO 4: ÍNDICES` hasta `-- PASO 5: TRIGGERS Y FUNCIONES`

Pega y ejecuta. ✅

---

### 📌 Sección 5: Triggers y Funciones (5 min)

Copia desde `-- PASO 5: TRIGGERS Y FUNCIONES` hasta `-- PASO 6: ROW LEVEL SECURITY`

Pega y ejecuta. ✅

---

### 📌 Sección 6: RLS (Row Level Security) (5 min)

Copia desde `-- PASO 6: ROW LEVEL SECURITY` hasta `-- PASO 7: VISTAS ÚTILES`

Pesa y ejecuta. ✅

---

### 📌 Sección 7: Vistas (2 min)

Copia desde `-- PASO 7: VISTAS ÚTILES` hasta `-- PASO 8: DATOS INICIALES`

Pega y ejecuta. ✅

---

### 📌 Sección 8: Datos Demo (1 min)

Copia desde `-- PASO 8: DATOS INICIALES` hasta el final del archivo

Pega y ejecuta. ✅

---

## ✅ PASO 4: Verificar que Todo Funcionó (5 min)

En Supabase SQL Editor, ejecuta:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Deberías ver ~18 tablas:**

```
audit_logs
automation_workflows
client_status
clients
companies
notifications
roles
sale_details
sale_payments
sales
service_categories
service_pricing
services
user_roles
users
vehicles
workflow_executions
workflow_triggers
```

---

## ✅ PASO 5: Verificar RLS Está Habilitado

```sql
-- Verificar RLS en tablas críticas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'clients', 'sales', 'vehicles')
ORDER BY tablename;
```

**Deberías ver:**
```
users        | t (true = RLS habilitado)
clients      | t
sales        | t
vehicles     | t
```

---

## ✅ PASO 6: Verificar Empresa Demo Existe

```sql
SELECT id, name, subscription_tier FROM companies LIMIT 1;
```

**Deberías ver:**
```
id   | name           | subscription_tier
-----|----------------|------------------
xxx  | Lavadero Demo  | pro
```

---

## ✅ PASO 7: Configurar Variables de Sesión RLS (IMPORTANTE)

Ahora necesitas configurar cómo Supabase calcula `current_user_company_id()`.

Ve a **Project Settings** → **Database** → **PostgreSQL Connection Pooling**

En la sección de configuración, verifica que Supabase esté configurado para pasar el `company_id` en el JWT del usuario. 

**En el archivo `.env.local` de tu Next.js, necesitarás pasar esto cuando hagas login:**

```
SET app.current_company_id = 'uuid-de-la-empresa';
```

Esto se hace automáticamente en tu middleware si lo configuras correctamente.

---

## 🎯 PRÓXIMOS PASOS

✅ Si todo se vio bien, ahora:

1. **Configura el middleware de Next.js** para pasar `company_id` al BD
2. **Crea fixtures de data** (usuarios, roles, clientes demo)
3. **Prueba RLS** haciendo queries desde tu Next.js app

---

## 🚨 Si Hay Errores

### Error: `relation "companies" already exists`

**Solución**: Las tablas ya existen. Esto es normal si ejecutaste el script antes.

El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutar de nuevo.

### Error: `type "role_name_type" already exists`

**Solución**: Igual que arriba. El `DO $$` IF NOT EXISTS maneja esto.

### Error: `permission denied` en RLS

**Solución**: Probablemente estés usando una key que no tiene permisos. 

Usa la **SUPABASE_SERVICE_ROLE_KEY** para cosas administrativas.

### Error: `current_user_company_id()` returns NULL

**Solución**: Necesitas configurar el JWT correctamente en Next.js.

Ve a "PASO 7" arriba.

---

## 📝 Resumen Checklist

- [ ] Extensiones creadas
- [ ] Enumeraciones creadas  
- [ ] Tablas creadas (18 tablas)
- [ ] Índices creados
- [ ] Triggers creados
- [ ] RLS habilitado
- [ ] Vistas creadas
- [ ] Empresa demo existe
- [ ] RLS verificado (`rowsecurity = t`)
- [ ] Puedo ver tablas en Supabase Editor

---

**Si todo está ✅, tu base de datos está 100% lista.**

Procede a [FIXTURES_DATA_DEMO.sql](FIXTURES_DATA_DEMO.sql) para crear datos de prueba.
