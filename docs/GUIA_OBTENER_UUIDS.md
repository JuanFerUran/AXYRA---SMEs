# 🔑 Guía Rápida: Obtener UUIDs para Fixtures

Cuando ejecutes [FIXTURES_DATA_DEMO.sql](FIXTURES_DATA_DEMO.sql), necesitarás reemplazar placeholders como `COMPANY_UUID_AQUI` con valores reales.

Usa esta guía para obtener los UUIDs correctos.

---

## 📍 PASO 1: Obtener COMPANY_UUID

En Supabase SQL Editor, ejecuta:

```sql
SELECT id, name FROM companies LIMIT 5;
```

Copia el `id` de "Lavadero Demo". Ejemplo:
```
id: 550e8400-e29b-41d4-a716-446655440000
```

**Reemplaza**: `'COMPANY_UUID_AQUI'` con este ID en FIXTURES_DATA_DEMO.sql

---

## 📍 PASO 2: Obtener STATUS_NUEVO_ID

Ejecuta:

```sql
SELECT id, name FROM client_status WHERE name = 'Nuevo' LIMIT 1;
```

Copia el `id`. Ejemplo:
```
id: 660e8400-e29b-41d4-a716-446655440001
```

**Reemplaza**: `'STATUS_NUEVO_ID'` con este ID

---

## 📍 PASO 3: Crear Usuarios y Obtener IDs

Primero, ejecuta esta parte de FIXTURES_DATA_DEMO.sql:

```sql
INSERT INTO users (
  id,
  company_id,
  email,
  full_name,
  phone,
  auth_provider,
  is_active
) VALUES 
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'admin@lavadero.demo', 'Juan Administrador', '+1234567890', 'supabase', true),
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'empleado@lavadero.demo', 'María Empleada', '+0987654321', 'supabase', true),
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'gerente@lavadero.demo', 'Carlos Gerente', '+5555555555', 'supabase', true);
```

(Reemplaza `'COMPANY_UUID_AQUI'` con el valor del PASO 1)

Luego, obtén los IDs:

```sql
SELECT id, email, full_name FROM users WHERE email IN ('admin@lavadero.demo', 'empleado@lavadero.demo', 'gerente@lavadero.demo');
```

Copia los UUIDs:
```
id: 770e8400-e29b-41d4-a716-446655440002  | admin@lavadero.demo
id: 880e8400-e29b-41d4-a716-446655440003  | empleado@lavadero.demo
id: 990e8400-e29b-41d4-a716-446655440004  | gerente@lavadero.demo
```

**Reemplaza**:
- `'ADMIN_USER_ID'` → 770e8400-e29b-41d4-a716-446655440002
- `'EMPLOYEE_USER_ID'` → 880e8400-e29b-41d4-a716-446655440003
- `'MANAGER_USER_ID'` → 990e8400-e29b-41d4-a716-446655440004

---

## 📍 PASO 4: Obtener ROLE IDs

Después de insertar roles, ejecuta:

```sql
SELECT id, name FROM roles WHERE company_id = 'COMPANY_UUID_AQUI';
```

Copia los IDs:
```
id: aa0e8400-e29b-41d4-a716-446655440005  | admin
id: bb0e8400-e29b-41d4-a716-446655440006  | employee
id: cc0e8400-e29b-41d4-a716-446655440007  | manager
```

**Reemplaza**:
- `'ADMIN_ROLE_ID'` → aa0e8400-e29b-41d4-a716-446655440005
- `'EMPLOYEE_ROLE_ID'` → bb0e8400-e29b-41d4-a716-446655440006
- `'MANAGER_ROLE_ID'` → cc0e8400-e29b-41d4-a716-446655440007

---

## 📍 PASO 5: Obtener CATEGORY IDs

Después de insertar categorías:

```sql
SELECT id, name FROM service_categories WHERE company_id = 'COMPANY_UUID_AQUI';
```

Copia los IDs:
```
id: dd0e8400-e29b-41d4-a716-446655440008  | Lavado Básico
id: ee0e8400-e29b-41d4-a716-446655440009  | Detallado
id: ff0e8400-e29b-41d4-a716-446655440010  | Mantenimiento
id: 00e08400-e29b-41d4-a716-446655440011  | Protección
```

**Reemplaza**:
- `'LAVADO_BASICO_CATEGORY_ID'` → dd0e8400-e29b-41d4-a716-446655440008
- `'DETALLADO_CATEGORY_ID'` → ee0e8400-e29b-41d4-a716-446655440009
- `'MANTENIMIENTO_CATEGORY_ID'` → ff0e8400-e29b-41d4-a716-446655440010
- `'PROTECCION_CATEGORY_ID'` → 00e08400-e29b-41d4-a716-446655440011

---

## 📍 PASO 6: Obtener SERVICE IDs

```sql
SELECT id, name FROM services WHERE company_id = 'COMPANY_UUID_AQUI' ORDER BY name;
```

Copia todos los IDs. Importante para sale_details. Ejemplo:
```
SERVICE_LAVADO_EXTERIOR       → 11e08400-e29b-41d4-a716-446655440012
SERVICE_LAVADO_INTERIOR       → 22e08400-e29b-41d4-a716-446655440013
SERVICE_LAVADO_COMPLETO       → 33e08400-e29b-41d4-a716-446655440014
SERVICE_DETALLADO_EXTERIOR    → 44e08400-e29b-41d4-a716-446655440015
SERVICE_CAMBIO_ACEITE         → 55e08400-e29b-41d4-a716-446655440016
SERVICE_SELLADO_PINTURA       → 66e08400-e29b-41d4-a716-446655440017
```

**Reemplaza** en FIXTURES_DATA_DEMO.sql todos los `'SERVICE_*'`

---

## 📍 PASO 7: Obtener CLIENT IDs

Después de insertar clientes:

```sql
SELECT id, first_name, email FROM clients WHERE company_id = 'COMPANY_UUID_AQUI' ORDER BY created_at DESC;
```

Copia en el orden que aparezcan:
```
id: 77e08400-e29b-41d4-a716-446655440018  | Carlos | carlos.mendoza@email.com
id: 88e08400-e29b-41d4-a716-446655440019  | María | maria.gonzalez@email.com
id: 99e08400-e29b-41d4-a716-446655440020  | Roberto | rlopez@email.com
id: aa0e0800-e29b-41d4-a716-446655440021  | Alejandra | alejandra.m@email.com
```

**Reemplaza**:
- `'CLIENT_ID_CARLOS'` → 77e08400-e29b-41d4-a716-446655440018
- `'CLIENT_ID_MARIA'` → 88e08400-e29b-41d4-a716-446655440019
- `'CLIENT_ID_ROBERTO'` → 99e08400-e29b-41d4-a716-446655440020
- `'CLIENT_ID_ALEJANDRA'` → aa0e0800-e29b-41d4-a716-446655440021

---

## 📍 PASO 8: Obtener VEHICLE IDs

```sql
SELECT id, license_plate, client_id FROM vehicles WHERE company_id = 'COMPANY_UUID_AQUI' ORDER BY created_at DESC;
```

Copia los IDs:
```
id: bb0e0800-e29b-41d4-a716-446655440022  | MNT-1234
id: cc0e0800-e29b-41d4-a716-446655440023  | MNT-5678
id: dd0e0800-e29b-41d4-a716-446655440024  | GDL-9012
id: ee0e0800-e29b-41d4-a716-446655440025  | MNT-3456
id: ff0e0800-e29b-41d4-a716-446655440026  | CDMX-7890
```

**Reemplaza**:
- `'VEHICLE_ID_1'` → bb0e0800-e29b-41d4-a716-446655440022
- `'VEHICLE_ID_2'` → cc0e0800-e29b-41d4-a716-446655440023
- (y así...)

---

## 📍 PASO 9: Obtener SALES IDs

```sql
SELECT id, sale_number FROM sales WHERE company_id = 'COMPANY_UUID_AQUI' ORDER BY created_at DESC;
```

Copia los IDs:
```
id: 11e1e800-e29b-41d4-a716-446655440027  | SAL-2026-0001
id: 22e1e800-e29b-41d4-a716-446655440028  | SAL-2026-0002
id: 33e1e800-e29b-41d4-a716-446655440029  | SAL-2026-0003
id: 44e1e800-e29b-41d4-a716-446655440030  | SAL-2026-0004
```

**Reemplaza**:
- `'SALE_ID_1'` → 11e1e800-e29b-41d4-a716-446655440027
- `'SALE_ID_2'` → 22e1e800-e29b-41d4-a716-446655440028
- (y así...)

---

## 🎯 RESUMEN - REEMPLAZOS NECESARIOS

| Placeholder | Query para obtener | Ejemplo |
|-------------|-------------------|---------|
| `'COMPANY_UUID_AQUI'` | `SELECT id FROM companies LIMIT 1;` | 550e8400-... |
| `'STATUS_NUEVO_ID'` | `SELECT id FROM client_status WHERE name='Nuevo';` | 660e8400-... |
| `'ADMIN_USER_ID'` | `SELECT id FROM users WHERE email='admin@...';` | 770e8400-... |
| `'EMPLOYEE_USER_ID'` | `SELECT id FROM users WHERE email='empleado@...';` | 880e8400-... |
| `'ADMIN_ROLE_ID'` | `SELECT id FROM roles WHERE name='admin';` | aa0e8400-... |
| `'LAVADO_BASICO_CATEGORY_ID'` | `SELECT id FROM service_categories WHERE name='Lavado Básico';` | dd0e8400-... |
| `'SERVICE_LAVADO_COMPLETO'` | `SELECT id FROM services WHERE name='Lavado Completo';` | 33e08400-... |
| `'CLIENT_ID_CARLOS'` | `SELECT id FROM clients WHERE first_name='Carlos';` | 77e08400-... |
| `'VEHICLE_ID_1'` | `SELECT id FROM vehicles ORDER BY created_at LIMIT 1;` | bb0e0800-... |
| `'SALE_ID_1'` | `SELECT id FROM sales WHERE sale_number='SAL-2026-0001';` | 11e1e800-... |

---

## 💡 TIPS ÚTILES

### Buscar todos los placeholders en FIXTURES_DATA_DEMO.sql:

En tu editor de texto (VS Code), usa Find & Replace para ver todos:
- Abre FIXTURES_DATA_DEMO.sql
- Presiona `Ctrl+F` (Mac: `Cmd+F`)
- Busca: `_AQUI` o `_ID_`

Esto te mostrará todos los placeholders que necesitas reemplazar.

### Script para obtener TODOS los UUIDs de una vez:

```sql
-- Copiar y ejecutar en Supabase para obtener un resumen
SELECT 
  'COMPANY_UUID_AQUI' as placeholder,
  id as value,
  'companies' as table_name
FROM companies LIMIT 1

UNION ALL

SELECT 'STATUS_NUEVO_ID', id, 'client_status'
FROM client_status WHERE name = 'Nuevo' LIMIT 1

UNION ALL

SELECT 'ADMIN_USER_ID', id, 'users'
FROM users WHERE email = 'admin@lavadero.demo' LIMIT 1

UNION ALL

SELECT 'ADMIN_ROLE_ID', id, 'roles'
FROM roles WHERE name = 'admin' LIMIT 1;
```

---

## ✅ CHECKLIST DE REEMPLAZOS

Antes de ejecutar FIXTURES_DATA_DEMO.sql, verifica:

- [ ] Reemplacé todos `'COMPANY_UUID_AQUI'` (busca con Ctrl+F)
- [ ] Reemplacé todos `'STATUS_*'`
- [ ] Reemplacé todos `'*_USER_ID'`
- [ ] Reemplacé todos `'*_ROLE_ID'`
- [ ] Reemplacé todos `'*_CATEGORY_ID'`
- [ ] Reemplacé todos `'SERVICE_*'`
- [ ] Reemplacé todos `'CLIENT_ID_*'`
- [ ] Reemplacé todos `'VEHICLE_ID_*'`
- [ ] Reemplacé todos `'SALE_ID_*'`

**Si no estás seguro de algún valor, déjalo en blanco y ejecuta el statement. Supabase te mostrará un error con el UUID esperado.**

---

¿Necesitas ayuda obteniendo un UUID específico? Pregunta.
