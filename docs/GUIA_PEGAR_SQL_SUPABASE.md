# 🚀 GUÍA RÁPIDA - PEGAR SQL EN SUPABASE

**Objetivo**: Ejecutar SOLO la estructura (sin datos demo)  
**Tiempo total**: 15 minutos  
**Complejidad**: Copiar y pegar (sin configuración)

---

## 📋 PASOS

### 1️⃣ Abre Supabase SQL Editor

```
1. Ve a: https://supabase.com
2. Ingresa a tu proyecto
3. Selecciona: SQL Editor (lado izquierdo)
4. Click en: New Query
```

### 2️⃣ Copia PASO 1 → Extensiones

**Archivo**: [SQL_ESTRUCTURA_LIMPIA_SUPABASE.sql](SQL_ESTRUCTURA_LIMPIA_SUPABASE.sql)

**Ubica en el archivo la sección:**
```
-- ============================================================================
-- PASO 1: EXTENSIONES REQUERIDAS
-- ============================================================================
```

**Copia SOLO esas líneas** (hasta antes de PASO 2):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**En Supabase:**
- Pega en SQL Editor
- Click: RUN
- ✅ Si no hay error = exitoso

### 3️⃣ Copia PASO 2 → Tipos/Enums

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 2: ENUMERACIONES Y TIPOS CUSTOMIZADOS
-- ============================================================================
```

**Copia TODA esa sección** (el bloque `DO $$ ... $$ LANGUAGE plpgsql;`)

**En Supabase:**
- Crea NEW Query (arriba)
- Pega
- Click: RUN
- ✅ Sin errores = ok

### 4️⃣ Copia PASO 3 → Tablas

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 3: CREAR TABLAS
-- ============================================================================
```

**Copia TODAS las tablas** (desde `CREATE TABLE` hasta antes de PASO 4)

**En Supabase:**
- NEW Query
- Pega
- RUN
- ✅ OK

### 5️⃣ Copia PASO 4 → Índices

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 4: CREAR ÍNDICES (OPTIMIZACIÓN)
-- ============================================================================
```

**Copia TODOS los CREATE INDEX**

**En Supabase:**
- NEW Query
- Pega
- RUN
- ✅ OK

### 6️⃣ Copia PASO 5 → Triggers

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 5: TRIGGERS Y FUNCIONES DE AUDITORÍA
-- ============================================================================
```

**Copia TODO (funciones + triggers)**

**En Supabase:**
- NEW Query
- Pega
- RUN
- ✅ OK

### 7️⃣ Copia PASO 6 → RLS

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 6: ROW LEVEL SECURITY (RLS)
-- ============================================================================
```

**Copia TODA la sección RLS**

**En Supabase:**
- NEW Query
- Pega
- RUN
- ✅ OK

### 8️⃣ Copia PASO 7 → Vistas (Opcional)

**En el archivo, ubica:**
```
-- ============================================================================
-- PASO 7: VISTAS PARA REPORTING (OPCIONAL)
-- ============================================================================
```

**Copia TODAS las vistas**

**En Supabase:**
- NEW Query
- Pega
- RUN
- ✅ OK

---

## ✅ VERIFICACIÓN FINAL

Después de completar TODO, ejecuta estas queries en Supabase:

### Query 1: ¿Se crearon las 18 tablas?

```sql
SELECT COUNT(*) as total_tablas 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Deberías ver:** `18`

### Query 2: ¿RLS está habilitado?

```sql
SELECT COUNT(*) as rls_habilitado 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

**Deberías ver:** `16`

### Query 3: ¿Existen los índices?

```sql
SELECT COUNT(*) as total_indices 
FROM pg_indexes 
WHERE schemaname = 'public';
```

**Deberías ver:** `60+`

### Query 4: ¿Existen las vistas?

```sql
SELECT COUNT(*) as total_vistas 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'VIEW';
```

**Deberías ver:** `4`

---

## 🎯 AHORA: USA LA PÁGINA

**La BD está LISTA y VACÍA.** Desde aquí:

1. **Abre tu Next.js**:
   ```bash
   npm run dev
   ```

2. **Crea una empresa** desde el registro de tu página

3. **Crea usuarios, clientes, servicios, etc.** desde la página

4. **Todo se almacena automáticamente** en Supabase

5. **La auditoría registra cada cambio** automáticamente

---

## 📊 Resumen

| PASO | Tarea | Tiempo | ✅ |
|------|-------|--------|-----|
| 1 | Extensiones | 1 min | |
| 2 | Tipos/Enums | 1 min | |
| 3 | 18 Tablas | 3 min | |
| 4 | Índices | 2 min | |
| 5 | Triggers | 2 min | |
| 6 | RLS | 2 min | |
| 7 | Vistas | 1 min | |
| **VERIFICACIÓN** | **Queries** | **2 min** | |
| **TOTAL** | **15 minutos** | **✅** | |

---

## ⚠️ Si Algo Falla

### Error: "relation already exists"
**Significa**: Ya ejecutaste ese PASO antes.  
**Solución**: Es normal, continúa con el siguiente PASO.

### Error: "syntax error"
**Significa**: Copiaste incorrectamente.  
**Solución**: Borra la Query, abre el archivo SQL de nuevo, copia completamente.

### Error: "permission denied"
**Significa**: Necesitas usar la SERVICE ROLE KEY.  
**Solución**: En Supabase, asegúrate de estar en SQL Editor (no en API).

### La BD se ve vacía
**Esperado**: ¡Eso es correcto! No hay datos demo.  
**Siguiente**: Crea todo desde tu página Next.js.

---

## 🔄 Flujo Completo

```
1. Ejecutar SQL estructura (PASOS 1-7)
   ↓
2. Verificar 18 tablas creadas
   ↓
3. Abrir Next.js local
   ↓
4. Registrar empresa desde página
   ↓
5. Crear usuarios desde página
   ↓
6. Crear clientes desde página
   ↓
7. Crear vehículos desde página
   ↓
8. Crear servicios desde página
   ↓
9. Crear ventas desde página
   ↓
10. Auditoría se registra automáticamente
    ↓
✅ Sistema 100% funcional
```

---

## 🚀 ¡COMENZAR AHORA!

1. Abre: [SQL_ESTRUCTURA_LIMPIA_SUPABASE.sql](SQL_ESTRUCTURA_LIMPIA_SUPABASE.sql)
2. Copia PASO 1
3. Ve a Supabase SQL Editor
4. Pega y ejecuta
5. Repite con PASOS 2-7
6. Verifica las 4 queries
7. ¡Listo!

---

**Tiempo total: 15 minutos**  
**Resultado: BD lista para producción sin datos demo**  
**Siguientes: Crear todo desde la página en tiempo real** 🎯
