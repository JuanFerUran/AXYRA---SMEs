# Fix Registro y Login - Implementación Completada

## 📋 Problema Identificado

El flujo de autenticación tenía dos problemas críticos:

### 1. **Registro (signup) no persistía datos**
- ❌ Solo creaba `auth.users` en Supabase Auth
- ❌ NO creaba registros en `companies`, `users`, `roles`, `user_roles`
- ❌ Resultado: Forma mostraba éxito pero tabla `users` vacía

### 2. **Login se quedaba en "ingresando" indefinidamente**
- ❌ No actualizaba `last_login_at` en tabla `users`
- ❌ Posible problema de acceso RLS a datos
- ❌ Middleware esperaba que usuario exista en tabla `users`

---

## ✅ Soluciones Implementadas

### **1. Server Action: `completeRegistration()` en `src/actions/auth.ts`**

Crea toda la estructura necesaria después de que Supabase Auth confirma el usuario:

```typescript
await completeRegistration(authUserId, email, firstName, lastName);
```

**¿Qué hace?**

1. ✅ Crea registro en tabla `companies`
   - name: Nombre del usuario
   - subscription_tier: 'free'
   - is_active: true

2. ✅ Crea registro en tabla `users`
   - id: auth.users.id
   - company_id: Del paso 1
   - email: Del usuario
   - full_name: Nombre + Apellido
   - auth_provider: 'supabase'
   - is_active: true

3. ✅ Crea o actualiza rol `admin` con permisos completos
   - clients: create/read/update/delete
   - sales: create/read/update/delete
   - vehicles: create/read/update/delete
   - services: create/read/update/delete
   - users: manage
   - roles: manage
   - reports: view
   - audit: view

4. ✅ Asigna rol `admin` al usuario
   - Crea registro en `user_roles`

5. ✅ Crea estados por defecto de clientes
   - Nuevo, Activo, Inactivo, VIP

**Manejo de Errores:**
- Si falla en cualquier paso, lanza excepción con mensaje descriptivo
- El registro se aborta para evitar datos inconsistentes

---

### **2. Server Action: `updateLoginTimestamp()` en `src/actions/auth.ts`**

Se ejecuta después del login exitoso:

```typescript
await updateLoginTimestamp(authUserId);
```

**¿Qué hace?**

1. ✅ Verifica que usuario existe en tabla `users`
   - Si no existe → Lanza error (usuario debe registrarse primero)

2. ✅ Actualiza `last_login_at` al timestamp actual
   - Permite auditoría de último acceso
   - Mejora cálculos de usuarios activos

**Manejo de Errores:**
- Si usuario no existe: Error descriptivo
- Si falla update: Error capturado pero NO bloquea login
- El error se registra en consola pero redirige igual

---

### **3. Actualización: `src/app/auth/register/page.tsx`**

**Cambios realizados:**

```typescript
// ANTES: Solo hacía signUp
await supabase.auth.signUp({ email, password, ... });

// AHORA: Después de signUp, completa registro
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ ... });
const authUserId = signUpData?.user?.id;

// Nuevo paso: Crear company, users, roles, etc.
await completeRegistration(authUserId, email, firstName, lastName);
```

**Flujo completo de Registro:**

```
1. Usuario completa formulario (email, password, nombre, apellido)
2. Click "Crear cuenta"
3. validar contraseñas coincidan
   ↓
4. Llamar supabase.auth.signUp()
   ↓ [Éxito]
5. Llamar completeRegistration(userId, email, firstName, lastName)
   ↓ [Crea companies, users, roles, user_roles, client_status]
6. Si tiene sesión inmediata → Redirigir a /dashboard
7. Si requiere confirmación email → Mensaje y redirigir a /login
```

---

### **4. Actualización: `src/app/auth/login/page.tsx`**

**Cambios realizados:**

```typescript
// ANTES: Solo hacía signIn
await supabase.auth.signInWithPassword({ email, password });

// AHORA: Después de signIn exitoso, actualiza timestamp
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

if (data?.session) {
  const authUserId = data.session.user.id;
  await updateLoginTimestamp(authUserId);  // ← Nuevo
  
  // Esperar 1 segundo para asegurar sesión
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Redirigir a dashboard
  router.replace('/dashboard');
}
```

**Flujo completo de Login:**

```
1. Usuario ingresa email y contraseña
2. Click "Ingresar"
3. Llamar supabase.auth.signInWithPassword()
   ↓ [Éxito]
4. Llamar updateLoginTimestamp(userId)
   ↓ [Actualiza last_login_at]
5. Esperar 1 segundo
6. Redirigir a /dashboard
   ↓ [Middleware verifica sesión válida]
7. Dashboard carga normalmente
```

---

## 🗂️ Archivos Modificados

### Nuevos archivos:
- **`src/actions/auth.ts`** - Server Actions para registro y login

### Modificados:
- **`src/app/auth/register/page.tsx`** - Integró completeRegistration()
- **`src/app/auth/login/page.tsx`** - Integró updateLoginTimestamp()

---

## 🧪 Pruebas Recomendadas

### Test 1: Nuevo Registro
```
1. Ir a /auth/register
2. Llenar formulario:
   - Nombre: "Juan"
   - Apellido: "Pérez"
   - Email: "juan@test.com"
   - Password: "Test1234!"
   - Confirmar: "Test1234!"
3. Click "Crear cuenta"

✅ Verificar en Supabase:
   - auth.users: 1 registro con "juan@test.com"
   - companies: 1 registro con name "Juan Pérez"
   - users: 1 registro con id = auth.users.id, company_id = companies.id
   - roles: 1 registro "admin" con permissions
   - user_roles: 1 registro vinculando user a role
   - client_status: 4 registros (Nuevo, Activo, Inactivo, VIP)
```

### Test 2: Confirmación de Email
```
1. Si SUPABASE_EMAIL_CONFIRMATION_TYPE = "email":
   - Debería redirigir a /auth/login
   - Mensaje: "Revisa tu correo..."
   - Usuario debe hacer click en enlace de confirmación

2. Luego login normalmente
```

### Test 3: Login Exitoso
```
1. Ir a /auth/login
2. Ingresar credenciales (juan@test.com / Test1234!)
3. Click "Ingresar"

✅ Debería:
   - No quedar en "Ingresando..." indefinidamente
   - Actualizar last_login_at en tabla users
   - Redirigir a /dashboard en ~2-3 segundos
```

### Test 4: Middleware Protection
```
1. Con sesión válida:
   - POST /dashboard → Accede (✅)
   - POST /auth/login → Redirige a /dashboard (✅)

2. Sin sesión:
   - POST /dashboard → Redirige a /auth/login (✅)
```

---

## ⚠️ Requisitos Previos

### Variables de Entorno (verifica .env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxx_public_key
SUPABASE_SERVICE_ROLE_KEY=xxxxxx_secret_key  ← CRÍTICO para Server Actions
```

### Configuración Supabase:
- ✅ Email confirmation: Configurable (puede ser desactivado para testing)
- ✅ RLS habilitado en 19 tablas (funciona con SERVICE_ROLE_KEY)
- ✅ Triggers de timestamps funcionando

---

## 🐛 Debugging

Si algo no funciona:

### Error: "Usuario no encontrado en la base de datos"
```
Causa: updateLoginTimestamp() no encontró usuario en tabla users
→ Significa completeRegistration() NO se ejecutó o falló silenciosamente
→ Revisar logs del servidor (next dev) o consola

Solución: Verificar SUPABASE_SERVICE_ROLE_KEY está en .env.local
```

### Error: "Sesión no válida después de login"
```
Causa: Middleware no encuentra sesión en cookies
→ La sesión no se guardó correctamente en cliente

Solución: 
  1. Verificar que no hay CORS issues
  2. Verificar cookies están habilitadas en navegador
  3. Revisar logs de red en DevTools (F12)
```

### Error: "Email ya registrado"
```
Causa: Ya existe auth.users con ese email
→ Normal si intentas registrar dos veces

Solución: Usar email diferente o limpiar auth.users en Supabase
```

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                      REGISTRO Y LOGIN FLOW                       │
└─────────────────────────────────────────────────────────────────┘

REGISTRO:
┌─────────────────────┐
│  register/page.tsx  │ ← User completa form
└──────────┬──────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 1. supabase.auth.signUp()                │
│    → Crea auth.users en Supabase Auth    │
└──────────┬───────────────────────────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 2. completeRegistration() (Server Action)│
│    → src/actions/auth.ts                 │
│                                          │
│    a) CREATE companies                   │
│    b) CREATE users                       │
│    c) UPSERT roles (admin)               │
│    d) CREATE user_roles                  │
│    e) CREATE client_status               │
└──────────┬───────────────────────────────┘
           │
           v
    ¿Sesión inmediata?
           │
    ┌──────┴──────┐
    │ SÍ    │  NO  │
    v             v
 DASHBOARD    LOGIN + Email
             Confirmación


LOGIN:
┌─────────────────────┐
│  login/page.tsx     │ ← User completa form
└──────────┬──────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 1. supabase.auth.signInWithPassword()    │
│    → Autentica contra auth.users         │
└──────────┬───────────────────────────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 2. updateLoginTimestamp() (Server Action)│
│    → src/actions/auth.ts                 │
│                                          │
│    a) Verificar usuario en tabla users   │
│    b) UPDATE last_login_at               │
└──────────┬───────────────────────────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 3. Esperar 1 segundo                     │
│    → Asegurar sesión establecida         │
└──────────┬───────────────────────────────┘
           │
           v
┌──────────────────────────────────────────┐
│ 4. router.replace('/dashboard')          │
│    → Middleware verifica sesión válida   │
│    → Dashboard carga normalmente          │
└──────────────────────────────────────────┘
```

---

## 📝 Próximos Pasos (No Implementados)

- [ ] Middleware para inyectar `company_id` en JWT headers (para RLS enforcement)
- [ ] Endpoint `/api/auth/me` para obtener datos del usuario actual
- [ ] Refrescar token automático cuando expira
- [ ] Logout endpoint para limpiar sesión
- [ ] Verificación de permisos RLS en queries

---

## ✨ Summary

- ✅ **Registro ahora persiste datos** en companies, users, roles
- ✅ **Login actualiza last_login_at** y verifica usuario existe
- ✅ **Manejo de errores robusto** con mensajes descriptivos
- ✅ **TypeScript compilable** sin errores
- ✅ **Listo para testing** en desarrollo
