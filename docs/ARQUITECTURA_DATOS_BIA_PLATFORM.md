# Arquitectura de Datos - BIA Platform
## Modelo Entidad-Relación Completo para Supabase PostgreSQL

**Versión:** 1.0  
**Fecha:** 2026-06-17  
**Autor:** Arquitecto de Datos Senior  
**Estado:** Listo para Implementación  

---

## Tabla de Contenidos
1. [Visión General](#1-visión-general)
2. [Modelo Entidad-Relación](#2-modelo-entidad-relación)
3. [Diccionario de Datos](#3-diccionario-de-datos)
4. [Relaciones y Cardinalidades](#4-relaciones-y-cardinalidades)
5. [Claves y Restricciones](#5-claves-y-restricciones)
6. [Estrategia de Índices](#6-estrategia-de-índices)
7. [Arquitectura Multiempresa SaaS](#7-arquitectura-multiempresa-saas)
8. [Sistema de Auditoría](#8-sistema-de-auditoría)
9. [Automatizaciones y Notificaciones](#9-automatizaciones-y-notificaciones)
10. [Seguridad y Row Level Security](#10-seguridad-y-row-level-security)
11. [Diagrama Textual Completo](#11-diagrama-textual-completo)

---

## 1. Visión General

### 1.1. Principios Arquitectónicos

La base de datos de BIA Platform se diseña siguiendo estos principios:

- **Escalabilidad Horizontal:** Estructura preparada para multiempresa desde el inicio
- **Integridad Referencial:** Garantía de consistencia mediante FK y constrains
- **Auditoría Completa:** Rastreo de todas las operaciones críticas
- **Seguridad por Capas:** RLS + Autenticación JWT + Validación Backend
- **Normalización:** 3NF con desnormalización estratégica para reporting
- **Soft Delete:** Preservación de datos históricos
- **Timestamps:** Rastreo de creación y modificación

### 1.2. Entidades Identificadas

```
AUTENTICACIÓN Y ACCESO:
├── companies          (Multiempresa SaaS)
├── users              (Usuarios del sistema)
├── roles              (Definición de permisos)
├── user_roles         (Relación M:N)
└── permissions        (Matriz de permisos)

GESTIÓN OPERATIVA:
├── clients            (Clientes del negocio)
├── client_status      (Estados: Nuevo, Activo, Inactivo)
├── vehicles           (Vehículos asociados a clientes)
├── services           (Catálogo de servicios)
├── service_categories (Categorización de servicios)
└── service_pricing    (Precios dinámicos por período)

TRANSACCIONES:
├── sales              (Encabezado de venta)
├── sale_details       (Detalle de servicios por venta)
└── sale_payments      (Registro de pagos)

AUTOMATIZACIÓN:
├── automation_workflows  (Workflows configurados)
├── workflow_triggers     (Triggers de ejecución)
├── workflow_executions   (Ejecuciones registradas)
└── notifications         (Logs de notificaciones)

AUDITORÍA Y LOGS:
└── audit_logs         (Registro de cambios)
```

---

## 2. Modelo Entidad-Relación

### 2.1. Entidades Principales

#### **TABLA: companies**
Soporte para multiempresa SaaS

```
companies
├── id (UUID, PK)
├── name (VARCHAR 255)
├── slug (VARCHAR 100, UNIQUE)
├── description (TEXT)
├── logo_url (VARCHAR 500)
├── website (VARCHAR 255)
├── subscription_tier (VARCHAR 50) [free|basic|pro|enterprise]
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: users**
Usuarios del sistema con autenticación JWT

```
users
├── id (UUID, PK)
├── company_id (UUID, FK)
├── email (VARCHAR 255, UNIQUE)
├── full_name (VARCHAR 255)
├── phone (VARCHAR 20)
├── avatar_url (VARCHAR 500)
├── auth_provider (VARCHAR 50) [supabase|google|microsoft]
├── is_active (BOOLEAN)
├── last_login_at (TIMESTAMP)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: roles**
Definición de roles del sistema

```
roles
├── id (UUID, PK)
├── company_id (UUID, FK)
├── name (VARCHAR 100) [admin|employee|manager]
├── description (TEXT)
├── is_system_role (BOOLEAN) [true para roles base]
├── permissions (JSONB) [Array de permisos]
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: user_roles**
Relación M:N entre usuarios y roles

```
user_roles
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── role_id (UUID, FK → roles)
├── assigned_at (TIMESTAMP)
└── assigned_by (UUID, FK → users)
```

#### **TABLA: clients**
Registro de clientes del negocio

```
clients
├── id (UUID, PK)
├── company_id (UUID, FK)
├── first_name (VARCHAR 100)
├── last_name (VARCHAR 100)
├── email (VARCHAR 255)
├── phone (VARCHAR 20, PRIMARY CONTACT)
├── phone_alt (VARCHAR 20)
├── date_of_birth (DATE)
├── gender (VARCHAR 20) [M|F|O|N]
├── document_type (VARCHAR 20) [DNI|RUT|CÉDULA|PASAPORTE]
├── document_number (VARCHAR 50)
├── address (VARCHAR 500)
├── city (VARCHAR 100)
├── state_province (VARCHAR 100)
├── postal_code (VARCHAR 20)
├── country (VARCHAR 100)
├── client_status_id (UUID, FK)
├── total_purchases (DECIMAL 15,2) [Desnormalizado para reportes]
├── lifetime_value (DECIMAL 15,2) [CLV calculado]
├── last_purchase_date (TIMESTAMP)
├── notes (TEXT)
├── preferred_contact (VARCHAR 20) [email|whatsapp|phone]
├── is_premium (BOOLEAN)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: client_status**
Estados de clientes (Nuevo, Activo, Inactivo)

```
client_status
├── id (UUID, PK)
├── name (VARCHAR 50) [Nuevo|Activo|Inactivo|VIP]
├── description (TEXT)
├── color_code (VARCHAR 7) [Ej: #FF5733]
├── is_default (BOOLEAN)
└── created_at (TIMESTAMP)
```

#### **TABLA: vehicles**
Vehículos asociados a clientes

```
vehicles
├── id (UUID, PK)
├── company_id (UUID, FK)
├── client_id (UUID, FK)
├── license_plate (VARCHAR 20)
├── vin (VARCHAR 50)
├── make (VARCHAR 100) [Marca: Toyota, Honda, etc.]
├── model (VARCHAR 100) [Modelo: Corolla, Civic, etc.]
├── year (INTEGER)
├── color (VARCHAR 50)
├── vehicle_type (VARCHAR 50) [sedan|suv|truck|van]
├── fuel_type (VARCHAR 50) [gasolina|diesel|hybrid|eléctrico]
├── registration_date (DATE)
├── last_service_date (TIMESTAMP)
├── next_service_date (TIMESTAMP)
├── mileage_km (INTEGER)
├── service_history_count (INTEGER) [Desnormalizado]
├── notes (TEXT)
├── is_active (BOOLEAN)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: service_categories**
Categorización de servicios

```
service_categories
├── id (UUID, PK)
├── company_id (UUID, FK)
├── name (VARCHAR 100) [Lavado, Detallado, Mantenimiento, etc.]
├── description (TEXT)
├── icon_code (VARCHAR 50)
├── display_order (INTEGER)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: services**
Catálogo maestro de servicios

```
services
├── id (UUID, PK)
├── company_id (UUID, FK)
├── service_category_id (UUID, FK)
├── name (VARCHAR 255)
├── description (TEXT)
├── base_price (DECIMAL 15,2)
├── duration_minutes (INTEGER)
├── is_taxable (BOOLEAN)
├── tax_rate (DECIMAL 5,2) [IVA u otros impuestos]
├── display_order (INTEGER)
├── is_active (BOOLEAN)
├── is_service (BOOLEAN) [true para servicios, false para productos]
├── requires_vehicle (BOOLEAN) [Obligatoriedad de vehículo]
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: service_pricing**
Precios dinámicos por período (para promotions, descuentos estacionales)

```
service_pricing
├── id (UUID, PK)
├── service_id (UUID, FK)
├── company_id (UUID, FK)
├── price (DECIMAL 15,2)
├── discount_percentage (DECIMAL 5,2)
├── effective_from (TIMESTAMP)
├── effective_until (TIMESTAMP)
├── priority (INTEGER) [Orden de aplicación]
├── reason (VARCHAR 255) [Ej: "Promoción Verano 2026"]
├── is_active (BOOLEAN)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: sales**
Encabezado de transacción de venta (Atomicidad garantizada)

```
sales
├── id (UUID, PK)
├── company_id (UUID, FK)
├── client_id (UUID, FK)
├── vehicle_id (UUID, FK) [Nullable si venta sin vehículo]
├── user_id (UUID, FK) [Usuario que registró la venta]
├── sale_number (VARCHAR 50, UNIQUE) [Número secuencial: SAL-2026-0001]
├── sale_date (TIMESTAMP)
├── subtotal (DECIMAL 15,2)
├── tax_amount (DECIMAL 15,2)
├── total_amount (DECIMAL 15,2)
├── discount_amount (DECIMAL 15,2)
├── discount_type (VARCHAR 20) [percentage|fixed|loyalty]
├── discount_reason (VARCHAR 255)
├── payment_method (VARCHAR 50) [cash|card|transfer|check]
├── payment_status (VARCHAR 50) [pending|paid|partial|refunded]
├── notes (TEXT)
├── is_cancelled (BOOLEAN)
├── cancelled_by (UUID, FK → users)
├── cancellation_reason (TEXT)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: sale_details**
Detalle atómico de servicios en venta

```
sale_details
├── id (UUID, PK)
├── sale_id (UUID, FK) [Relación 1:N con sales]
├── service_id (UUID, FK)
├── quantity (INTEGER)
├── unit_price (DECIMAL 15,2) [Precio congelado al momento de venta]
├── discount_amount (DECIMAL 15,2)
├── tax_amount (DECIMAL 15,2)
├── subtotal (DECIMAL 15,2)
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: sale_payments**
Registro detallado de pagos

```
sale_payments
├── id (UUID, PK)
├── sale_id (UUID, FK)
├── company_id (UUID, FK)
├── payment_method (VARCHAR 50)
├── amount (DECIMAL 15,2)
├── reference (VARCHAR 255) [Nº cheque, ref. transferencia, etc.]
├── payment_date (TIMESTAMP)
├── processed_by (UUID, FK → users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: automation_workflows**
Definición de workflows para n8n

```
automation_workflows
├── id (UUID, PK)
├── company_id (UUID, FK)
├── name (VARCHAR 255) [Bienvenida, Recuperación, Promoción, Cumpleaños]
├── description (TEXT)
├── workflow_type (VARCHAR 50) [welcome|recovery|promotion|birthday|custom]
├── trigger_type (VARCHAR 50) [client_created|inactivity|sales_milestone|birthday]
├── trigger_condition (JSONB) [Condiciones de activación]
├── n8n_workflow_id (VARCHAR 255) [ID del workflow en n8n]
├── is_active (BOOLEAN)
├── execution_count (INTEGER) [Métrica de uso]
├── last_execution_at (TIMESTAMP)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [Soft Delete]
```

#### **TABLA: workflow_triggers**
Configuración de triggers específicos

```
workflow_triggers
├── id (UUID, PK)
├── workflow_id (UUID, FK)
├── company_id (UUID, FK)
├── trigger_event (VARCHAR 100) [client_created|client_inactivity_60|sale_completed|birthday]
├── event_data (JSONB) [Datos específicos del trigger]
├── is_enabled (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: workflow_executions**
Registro de ejecuciones de workflows

```
workflow_executions
├── id (UUID, PK)
├── workflow_id (UUID, FK)
├── company_id (UUID, FK)
├── trigger_id (UUID, FK) [Qué trigger lo activó]
├── triggered_by_entity (VARCHAR 100) [client_id|sale_id|vehicle_id]
├── triggered_by_entity_id (UUID) [ID del registro que disparó]
├── status (VARCHAR 50) [pending|success|failed|retrying]
├── n8n_execution_id (VARCHAR 255)
├── error_message (TEXT)
├── retry_count (INTEGER)
├── response_data (JSONB) [Respuesta de n8n]
├── executed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: notifications**
Log de notificaciones enviadas via Evolution API/WhatsApp Business

```
notifications
├── id (UUID, PK)
├── company_id (UUID, FK)
├── client_id (UUID, FK)
├── workflow_execution_id (UUID, FK)
├── notification_type (VARCHAR 50) [welcome|recovery|promotion|birthday|manual]
├── channel (VARCHAR 50) [whatsapp|email|sms]
├── recipient_phone (VARCHAR 20) [Para WhatsApp]
├── recipient_email (VARCHAR 255) [Para Email]
├── recipient_number (VARCHAR 20) [Para SMS]
├── message_content (TEXT)
├── message_template_id (VARCHAR 255)
├── status (VARCHAR 50) [sent|delivered|read|failed|bounced]
├── external_message_id (VARCHAR 255) [ID de WhatsApp/Provider]
├── sent_at (TIMESTAMP)
├── delivered_at (TIMESTAMP)
├── read_at (TIMESTAMP)
├── error_reason (TEXT)
├── retry_count (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### **TABLA: audit_logs**
Registro completo de auditoría para compliance

```
audit_logs
├── id (UUID, PK)
├── company_id (UUID, FK)
├── user_id (UUID, FK) [Usuario que realizó la acción]
├── action (VARCHAR 100) [CREATE|UPDATE|DELETE|VIEW|EXPORT]
├── entity_type (VARCHAR 100) [clients|sales|vehicles|services]
├── entity_id (UUID) [ID del registro afectado]
├── old_values (JSONB) [Estado anterior para UPDATE/DELETE]
├── new_values (JSONB) [Estado nuevo para CREATE/UPDATE]
├── ip_address (VARCHAR 50)
├── user_agent (TEXT)
├── changes_summary (TEXT) [Resumen legible de cambios]
├── is_sensitive (BOOLEAN) [Datos sensibles: contraseñas, documentos]
├── created_at (TIMESTAMP) [Indizado para filtros temporales]
└── created_by_system (BOOLEAN) [true si fue acción automática]
```

---

## 3. Diccionario de Datos

### 3.1. Tabla: companies

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único de empresa |
| name | VARCHAR(255) | NO | - | UNIQUE | Nombre de la empresa |
| slug | VARCHAR(100) | NO | - | UNIQUE, LOWERCASE | Slug para URLs amigables |
| description | TEXT | SÍ | NULL | - | Descripción de la empresa |
| logo_url | VARCHAR(500) | SÍ | NULL | - | URL del logo |
| website | VARCHAR(255) | SÍ | NULL | - | Sitio web de la empresa |
| subscription_tier | VARCHAR(50) | NO | 'free' | CHECK IN (free\|basic\|pro\|enterprise) | Plan de suscripción |
| is_active | BOOLEAN | NO | true | - | Indica si está activa |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de última actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.2. Tabla: users

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK, FK:companies | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa a la que pertenece |
| email | VARCHAR(255) | NO | - | UNIQUE | Email del usuario |
| full_name | VARCHAR(255) | NO | - | - | Nombre completo |
| phone | VARCHAR(20) | SÍ | NULL | - | Teléfono de contacto |
| avatar_url | VARCHAR(500) | SÍ | NULL | - | URL de foto de perfil |
| auth_provider | VARCHAR(50) | NO | 'supabase' | CHECK IN (supabase\|google\|microsoft) | Proveedor de autenticación |
| is_active | BOOLEAN | NO | true | - | Indica si puede acceder |
| last_login_at | TIMESTAMP | SÍ | NULL | - | Último acceso registrado |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.3. Tabla: roles

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa propietaria del rol |
| name | VARCHAR(100) | NO | - | CHECK IN (admin\|employee\|manager\|custom) | Nombre del rol |
| description | TEXT | SÍ | NULL | - | Descripción de responsabilidades |
| is_system_role | BOOLEAN | NO | false | - | true para roles predefinidos |
| permissions | JSONB | NO | '[]' | - | Array de permisos JSON |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.4. Tabla: user_roles

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| user_id | UUID | NO | - | FK → users(id) ON DELETE CASCADE | Referencia a usuario |
| role_id | UUID | NO | - | FK → roles(id) ON DELETE CASCADE | Referencia a rol |
| assigned_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Cuando se asignó |
| assigned_by | UUID | NO | - | FK → users(id) | Usuario que asignó el rol |

### 3.5. Tabla: clients

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa propietaria |
| first_name | VARCHAR(100) | NO | - | - | Nombre |
| last_name | VARCHAR(100) | SÍ | NULL | - | Apellido |
| email | VARCHAR(255) | SÍ | NULL | UNIQUE WITHIN company_id | Email del cliente |
| phone | VARCHAR(20) | NO | - | - | Teléfono principal |
| phone_alt | VARCHAR(20) | SÍ | NULL | - | Teléfono alternativo |
| date_of_birth | DATE | SÍ | NULL | - | Fecha de nacimiento (para cumpleaños) |
| gender | VARCHAR(20) | SÍ | NULL | CHECK IN (M\|F\|O\|N) | Género |
| document_type | VARCHAR(20) | SÍ | NULL | CHECK IN (DNI\|RUT\|CÉDULA\|PASAPORTE) | Tipo de documento |
| document_number | VARCHAR(50) | SÍ | NULL | - | Número de documento |
| address | VARCHAR(500) | SÍ | NULL | - | Dirección completa |
| city | VARCHAR(100) | SÍ | NULL | - | Ciudad |
| state_province | VARCHAR(100) | SÍ | NULL | - | Provincia/Estado |
| postal_code | VARCHAR(20) | SÍ | NULL | - | Código postal |
| country | VARCHAR(100) | SÍ | NULL | - | País |
| client_status_id | UUID | NO | - | FK → client_status(id) | Estado del cliente |
| total_purchases | DECIMAL(15,2) | NO | 0.00 | >= 0 | Total de compras (desnormalizado) |
| lifetime_value | DECIMAL(15,2) | NO | 0.00 | >= 0 | CLV calculado |
| last_purchase_date | TIMESTAMP | SÍ | NULL | - | Última fecha de compra |
| notes | TEXT | SÍ | NULL | - | Notas adicionales |
| preferred_contact | VARCHAR(20) | NO | 'phone' | CHECK IN (email\|whatsapp\|phone) | Medio preferido |
| is_premium | BOOLEAN | NO | false | - | Indica si es cliente premium |
| created_by | UUID | NO | - | FK → users(id) | Usuario que registró |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.6. Tabla: client_status

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| name | VARCHAR(50) | NO | - | UNIQUE | Nombre del estado |
| description | TEXT | SÍ | NULL | - | Descripción |
| color_code | VARCHAR(7) | SÍ | '#000000' | Formato HEX | Color para UI |
| is_default | BOOLEAN | NO | false | - | Estado por defecto |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |

### 3.7. Tabla: vehicles

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa propietaria |
| client_id | UUID | NO | - | FK → clients(id) ON DELETE CASCADE | Cliente propietario |
| license_plate | VARCHAR(20) | NO | - | - | Placa de vehículo |
| vin | VARCHAR(50) | SÍ | NULL | - | Número de identificación |
| make | VARCHAR(100) | NO | - | - | Marca (Toyota, Honda, etc.) |
| model | VARCHAR(100) | NO | - | - | Modelo (Corolla, Civic, etc.) |
| year | INTEGER | NO | - | >= 1900 AND <= YEAR(NOW()) + 1 | Año de fabricación |
| color | VARCHAR(50) | SÍ | NULL | - | Color del vehículo |
| vehicle_type | VARCHAR(50) | SÍ | NULL | CHECK IN (sedan\|suv\|truck\|van\|motorcycle) | Tipo |
| fuel_type | VARCHAR(50) | SÍ | NULL | CHECK IN (gasolina\|diesel\|hybrid\|eléctrico) | Combustible |
| registration_date | DATE | SÍ | NULL | - | Fecha de registro |
| last_service_date | TIMESTAMP | SÍ | NULL | - | Último servicio |
| next_service_date | TIMESTAMP | SÍ | NULL | - | Próximo servicio sugerido |
| mileage_km | INTEGER | SÍ | NULL | >= 0 | Kilometraje actual |
| service_history_count | INTEGER | NO | 0 | >= 0 | Total de servicios |
| notes | TEXT | SÍ | NULL | - | Observaciones |
| is_active | BOOLEAN | NO | true | - | Indica si está activo |
| created_by | UUID | NO | - | FK → users(id) | Usuario que registró |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.8. Tabla: service_categories

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa propietaria |
| name | VARCHAR(100) | NO | - | UNIQUE WITHIN company_id | Nombre de categoría |
| description | TEXT | SÍ | NULL | - | Descripción |
| icon_code | VARCHAR(50) | SÍ | NULL | - | Código de ícono (fa-icon) |
| display_order | INTEGER | NO | 0 | - | Orden de visualización |
| is_active | BOOLEAN | NO | true | - | Activa o no |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.9. Tabla: services

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa propietaria |
| service_category_id | UUID | NO | - | FK → service_categories(id) | Categoría |
| name | VARCHAR(255) | NO | - | - | Nombre del servicio |
| description | TEXT | SÍ | NULL | - | Descripción detallada |
| base_price | DECIMAL(15,2) | NO | - | > 0 | Precio base |
| duration_minutes | INTEGER | SÍ | NULL | >= 0 | Duración estimada |
| is_taxable | BOOLEAN | NO | true | - | Se aplica impuesto |
| tax_rate | DECIMAL(5,2) | NO | 0.00 | >= 0 AND <= 100 | Porcentaje de impuesto |
| display_order | INTEGER | NO | 0 | - | Orden en catálogo |
| is_active | BOOLEAN | NO | true | - | Disponible para venta |
| is_service | BOOLEAN | NO | true | - | true=servicio, false=producto |
| requires_vehicle | BOOLEAN | NO | false | - | Requiere vehículo |
| created_by | UUID | NO | - | FK → users(id) | Creado por |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.10. Tabla: service_pricing

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| service_id | UUID | NO | - | FK → services(id) ON DELETE CASCADE | Servicio |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| price | DECIMAL(15,2) | NO | - | > 0 | Precio especial |
| discount_percentage | DECIMAL(5,2) | NO | 0.00 | >= 0 AND <= 100 | Descuento % |
| effective_from | TIMESTAMP | NO | - | - | Desde cuándo |
| effective_until | TIMESTAMP | SÍ | NULL | - | Hasta cuándo (NULL=indefinido) |
| priority | INTEGER | NO | 0 | >= 0 | Prioridad de aplicación |
| reason | VARCHAR(255) | SÍ | NULL | - | Motivo (promo, descuento) |
| is_active | BOOLEAN | NO | true | - | Precio activo |
| created_by | UUID | NO | - | FK → users(id) | Creado por |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.11. Tabla: sales

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| client_id | UUID | NO | - | FK → clients(id) | Cliente |
| vehicle_id | UUID | SÍ | NULL | FK → vehicles(id) | Vehículo (opcional) |
| user_id | UUID | NO | - | FK → users(id) | Vendedor/Registrador |
| sale_number | VARCHAR(50) | NO | - | UNIQUE WITHIN company_id | Número secuencial |
| sale_date | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de venta |
| subtotal | DECIMAL(15,2) | NO | - | >= 0 | Subtotal |
| tax_amount | DECIMAL(15,2) | NO | 0.00 | >= 0 | Impuestos |
| total_amount | DECIMAL(15,2) | NO | - | >= 0 | Total |
| discount_amount | DECIMAL(15,2) | NO | 0.00 | >= 0 | Descuento aplicado |
| discount_type | VARCHAR(20) | SÍ | NULL | CHECK IN (percentage\|fixed\|loyalty) | Tipo descuento |
| discount_reason | VARCHAR(255) | SÍ | NULL | - | Motivo del descuento |
| payment_method | VARCHAR(50) | NO | 'cash' | CHECK IN (cash\|card\|transfer\|check) | Forma de pago |
| payment_status | VARCHAR(50) | NO | 'pending' | CHECK IN (pending\|paid\|partial\|refunded) | Estado pago |
| notes | TEXT | SÍ | NULL | - | Notas |
| is_cancelled | BOOLEAN | NO | false | - | Indica si fue cancelada |
| cancelled_by | UUID | SÍ | NULL | FK → users(id) | Quién canceló |
| cancellation_reason | TEXT | SÍ | NULL | - | Motivo cancelación |
| created_by | UUID | NO | - | FK → users(id) | Creado por |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.12. Tabla: sale_details

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| sale_id | UUID | NO | - | FK → sales(id) ON DELETE CASCADE | Sale (relación 1:N) |
| service_id | UUID | NO | - | FK → services(id) | Servicio/Producto |
| quantity | INTEGER | NO | 1 | >= 1 | Cantidad |
| unit_price | DECIMAL(15,2) | NO | - | > 0 | Precio unitario (congelado) |
| discount_amount | DECIMAL(15,2) | NO | 0.00 | >= 0 | Descuento en línea |
| tax_amount | DECIMAL(15,2) | NO | 0.00 | >= 0 | Impuesto en línea |
| subtotal | DECIMAL(15,2) | NO | - | >= 0 | Subtotal línea |
| notes | TEXT | SÍ | NULL | - | Observaciones |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.13. Tabla: sale_payments

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| sale_id | UUID | NO | - | FK → sales(id) ON DELETE CASCADE | Venta |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| payment_method | VARCHAR(50) | NO | - | CHECK IN (cash\|card\|transfer\|check) | Método |
| amount | DECIMAL(15,2) | NO | - | > 0 | Monto pagado |
| reference | VARCHAR(255) | SÍ | NULL | - | Ref. transacción |
| payment_date | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha pago |
| processed_by | UUID | NO | - | FK → users(id) | Procesado por |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.14. Tabla: automation_workflows

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| name | VARCHAR(255) | NO | - | - | Nombre workflow |
| description | TEXT | SÍ | NULL | - | Descripción |
| workflow_type | VARCHAR(50) | NO | 'custom' | CHECK IN (welcome\|recovery\|promotion\|birthday\|custom) | Tipo |
| trigger_type | VARCHAR(50) | NO | - | CHECK IN (client_created\|inactivity\|sales_milestone\|birthday\|manual) | Trigger |
| trigger_condition | JSONB | SÍ | NULL | - | Condiciones JSON |
| n8n_workflow_id | VARCHAR(255) | SÍ | NULL | - | ID en n8n |
| is_active | BOOLEAN | NO | false | - | Activo |
| execution_count | INTEGER | NO | 0 | >= 0 | Total ejecuciones |
| last_execution_at | TIMESTAMP | SÍ | NULL | - | Última ejecución |
| created_by | UUID | NO | - | FK → users(id) | Creado por |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |
| deleted_at | TIMESTAMP | SÍ | NULL | - | Soft delete |

### 3.15. Tabla: workflow_triggers

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| workflow_id | UUID | NO | - | FK → automation_workflows(id) ON DELETE CASCADE | Workflow |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| trigger_event | VARCHAR(100) | NO | - | - | Nombre evento |
| event_data | JSONB | SÍ | NULL | - | Datos configuración |
| is_enabled | BOOLEAN | NO | true | - | Habilitado |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.16. Tabla: workflow_executions

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| workflow_id | UUID | NO | - | FK → automation_workflows(id) ON DELETE CASCADE | Workflow |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| trigger_id | UUID | SÍ | NULL | FK → workflow_triggers(id) | Trigger que lo activó |
| triggered_by_entity | VARCHAR(100) | NO | - | - | Tipo entidad (client_id, sale_id) |
| triggered_by_entity_id | UUID | NO | - | - | ID de la entidad |
| status | VARCHAR(50) | NO | 'pending' | CHECK IN (pending\|success\|failed\|retrying) | Estado ejecución |
| n8n_execution_id | VARCHAR(255) | SÍ | NULL | - | ID ejecución n8n |
| error_message | TEXT | SÍ | NULL | - | Mensaje de error |
| retry_count | INTEGER | NO | 0 | >= 0 | Intentos |
| response_data | JSONB | SÍ | NULL | - | Respuesta n8n |
| executed_at | TIMESTAMP | SÍ | NULL | - | Momento ejecución |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.17. Tabla: notifications

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| client_id | UUID | NO | - | FK → clients(id) ON DELETE CASCADE | Cliente |
| workflow_execution_id | UUID | SÍ | NULL | FK → workflow_executions(id) | Ejecución |
| notification_type | VARCHAR(50) | NO | - | CHECK IN (welcome\|recovery\|promotion\|birthday\|manual) | Tipo notificación |
| channel | VARCHAR(50) | NO | - | CHECK IN (whatsapp\|email\|sms) | Canal envío |
| recipient_phone | VARCHAR(20) | SÍ | NULL | - | Teléfono WhatsApp |
| recipient_email | VARCHAR(255) | SÍ | NULL | - | Email |
| recipient_number | VARCHAR(20) | SÍ | NULL | - | Número SMS |
| message_content | TEXT | NO | - | - | Contenido mensaje |
| message_template_id | VARCHAR(255) | SÍ | NULL | - | Template ID |
| status | VARCHAR(50) | NO | 'sent' | CHECK IN (sent\|delivered\|read\|failed\|bounced) | Estado envío |
| external_message_id | VARCHAR(255) | SÍ | NULL | - | ID externo (WhatsApp) |
| sent_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Enviado |
| delivered_at | TIMESTAMP | SÍ | NULL | - | Entregado |
| read_at | TIMESTAMP | SÍ | NULL | - | Leído |
| error_reason | TEXT | SÍ | NULL | - | Motivo error |
| retry_count | INTEGER | NO | 0 | >= 0 | Reintentos |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de actualización |

### 3.18. Tabla: audit_logs

| Campo | Tipo | Nullable | Default | Restricciones | Descripción |
|-------|------|----------|---------|---------------|-------------|
| id | UUID | NO | gen_random_uuid() | PK | Identificador único |
| company_id | UUID | NO | - | FK → companies(id) | Empresa |
| user_id | UUID | SÍ | NULL | FK → users(id) | Usuario que actuó |
| action | VARCHAR(100) | NO | - | CHECK IN (CREATE\|UPDATE\|DELETE\|VIEW\|EXPORT) | Tipo acción |
| entity_type | VARCHAR(100) | NO | - | - | Tabla afectada |
| entity_id | UUID | NO | - | - | ID registro |
| old_values | JSONB | SÍ | NULL | - | Valores anteriores |
| new_values | JSONB | SÍ | NULL | - | Valores nuevos |
| ip_address | VARCHAR(50) | SÍ | NULL | - | IP origen |
| user_agent | TEXT | SÍ | NULL | - | User agent |
| changes_summary | TEXT | SÍ | NULL | - | Resumen cambios |
| is_sensitive | BOOLEAN | NO | false | - | Datos sensibles |
| created_by_system | BOOLEAN | NO | false | - | Acción automática |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Fecha de creación |

---

## 4. Relaciones y Cardinalidades

### 4.1. Relaciones 1:N (Uno a Muchos)

```
companies (1) ──────→ (N) users
  └─ Una empresa tiene muchos usuarios
  
companies (1) ──────→ (N) roles
  └─ Una empresa define múltiples roles
  
companies (1) ──────→ (N) clients
  └─ Una empresa tiene muchos clientes
  
companies (1) ──────→ (N) vehicles
  └─ Una empresa registra múltiples vehículos
  
companies (1) ──────→ (N) services
  └─ Una empresa ofrece múltiples servicios
  
companies (1) ──────→ (N) sales
  └─ Una empresa realiza múltiples ventas
  
companies (1) ──────→ (N) automation_workflows
  └─ Una empresa configura múltiples workflows
  
clients (1) ──────→ (N) vehicles
  └─ Un cliente posee múltiples vehículos
  
clients (1) ──────→ (N) sales
  └─ Un cliente realiza múltiples compras
  
vehicles (1) ──────→ (N) sales
  └─ Un vehículo tiene múltiple historial de servicio
  
sales (1) ──────→ (N) sale_details
  └─ Una venta contiene múltiples líneas de detalle
  
sales (1) ──────→ (N) sale_payments
  └─ Una venta puede tener múltiples pagos parciales
  
services (1) ──────→ (N) service_pricing
  └─ Un servicio puede tener múltiples precios (promociones)
  
service_categories (1) ──────→ (N) services
  └─ Una categoría agrupa múltiples servicios
  
automation_workflows (1) ──────→ (N) workflow_triggers
  └─ Un workflow tiene múltiples triggers
  
automation_workflows (1) ──────→ (N) workflow_executions
  └─ Un workflow se ejecuta múltiples veces
  
users (1) ──────→ (N) user_roles
  └─ Un usuario puede tener múltiples roles
  
roles (1) ──────→ (N) user_roles
  └─ Un rol puede asignarse a múltiples usuarios
```

### 4.2. Relaciones N:N (Muchos a Muchos)

```
users (N) ←──────────────→ (N) roles
  Mediante tabla: user_roles
  └─ Un usuario puede tener múltiples roles
  └─ Un rol puede asignarse a múltiples usuarios
```

### 4.3. Relaciones 1:1 (Uno a Uno)

```
No hay relaciones 1:1 puras en este diseño.
Sin embargo, user_roles proporciona una flexibilidad 1:N
que puede actuar como 1:1 en casos específicos.
```

---

## 5. Claves y Restricciones

### 5.1. Primary Keys (PK)

Todas las tablas utilizan **UUID** como PK:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Ventajas:**
- Generación distribuida (sin punto único de fallo)
- No expone secuencia de IDs
- Compatible con replicación
- Seguridad mejorada

### 5.2. Foreign Keys (FK)

#### FK con ON DELETE CASCADE (Eliminación en cascada)

Usado cuando la entidad dependiente **no tiene sentido sin su padre**:

```
user_roles → users
  Si se elimina un usuario, se elimina su relación de roles
  
sale_details → sales
  Si se elimina una venta, se eliminan sus detalles
  
workflow_triggers → automation_workflows
  Si se elimina un workflow, se eliminan sus triggers
```

#### FK con ON DELETE RESTRICT (Restricción)

Usado cuando la entidad dependiente **debe preservarse**:

```
sales → clients
  No se puede eliminar un cliente si tiene ventas
  (Soft delete preserva la referencia)
  
sale_payments → sales
  No se puede eliminar una venta si tiene pagos registrados
```

#### FK con ON DELETE SET NULL (Nulable)

Usado cuando la referencia es **opcional**:

```
sales → vehicles (es opcional)
  Una venta sin vehículo específico es válida
  
workflow_executions → workflow_triggers
  Un trigger puede no estar asociado a ejecución
```

### 5.3. Unique Keys

```
companies.name
companies.slug
users.email
clients.email (UNIQUE WITHIN company_id)
vehicles.license_plate (UNIQUE WITHIN company_id)
sale_number (UNIQUE WITHIN company_id)
service_categories.name (UNIQUE WITHIN company_id)
```

### 5.4. Composite Keys

```
clients (company_id, email)
  ├─ Garantiza unicidad de email por empresa
  
vehicles (company_id, license_plate)
  ├─ Garantiza unicidad de placa por empresa
  
sales (company_id, sale_number)
  ├─ Garantiza unicidad de número de venta
  
user_roles (user_id, role_id)
  ├─ Evita asignación duplicada de rol a usuario
  
workflow_triggers (workflow_id, trigger_event)
  ├─ Evita triggers duplicados en mismo workflow
```

### 5.5. Check Constraints

```
companies.subscription_tier IN (free, basic, pro, enterprise)
users.auth_provider IN (supabase, google, microsoft)
roles.name IN (admin, employee, manager)
clients.gender IN (M, F, O, N)
clients.document_type IN (DNI, RUT, CÉDULA, PASAPORTE)
clients.preferred_contact IN (email, whatsapp, phone)
vehicles.vehicle_type IN (sedan, suv, truck, van, motorcycle)
vehicles.fuel_type IN (gasolina, diesel, hybrid, eléctrico)
services.is_taxable BOOLEAN
sales.discount_type IN (percentage, fixed, loyalty)
sales.payment_status IN (pending, paid, partial, refunded)
sales.payment_method IN (cash, card, transfer, check)
automation_workflows.workflow_type IN (welcome, recovery, promotion, birthday, custom)
automation_workflows.trigger_type IN (client_created, inactivity, sales_milestone, birthday, manual)
notifications.notification_type IN (welcome, recovery, promotion, birthday, manual)
notifications.channel IN (whatsapp, email, sms)
notifications.status IN (sent, delivered, read, failed, bounced)
audit_logs.action IN (CREATE, UPDATE, DELETE, VIEW, EXPORT)
```

---

## 6. Estrategia de Índices

### 6.1. Índices por Tabla

#### **companies**
```sql
INDEX idx_companies_slug ON companies(slug)
  Razón: Búsquedas por slug en URLs
  
INDEX idx_companies_is_active ON companies(is_active)
  Razón: Filtro de empresas activas
```

#### **users**
```sql
INDEX idx_users_company_id ON users(company_id)
  Razón: FK común, búsqueda de usuarios por empresa
  
INDEX idx_users_email ON users(email)
  Razón: Autenticación por email
  
INDEX idx_users_company_id_is_active ON users(company_id, is_active)
  Razón: Filtro: usuarios activos por empresa
  
INDEX idx_users_last_login_at ON users(last_login_at)
  Razón: Reportes de actividad
```

#### **roles**
```sql
INDEX idx_roles_company_id ON roles(company_id)
  Razón: FK común, búsqueda de roles por empresa
  
INDEX idx_roles_name ON roles(name)
  Razón: Búsqueda de roles por nombre
```

#### **user_roles**
```sql
INDEX idx_user_roles_user_id ON user_roles(user_id)
  Razón: FK común, obtener roles de usuario
  
INDEX idx_user_roles_role_id ON user_roles(role_id)
  Razón: FK común, obtener usuarios de rol
  
UNIQUE INDEX idx_user_roles_unique ON user_roles(user_id, role_id)
  Razón: Evitar duplicados
```

#### **clients**
```sql
INDEX idx_clients_company_id ON clients(company_id)
  Razón: FK común, búsqueda de clientes por empresa
  
INDEX idx_clients_phone ON clients(phone)
  Razón: Búsqueda por teléfono (WhatsApp)
  
INDEX idx_clients_email ON clients(email)
  Razón: Búsqueda de clientes por email
  
INDEX idx_clients_company_id_client_status_id ON clients(company_id, client_status_id)
  Razón: Dashboard: clientes por estado
  
INDEX idx_clients_last_purchase_date ON clients(last_purchase_date DESC)
  Razón: KPI: clientes activos, inactividad
  
INDEX idx_clients_date_of_birth ON clients(date_of_birth)
  Razón: Workflow cumpleaños
  
INDEX idx_clients_created_at ON clients(created_at DESC)
  Razón: Reportes: clientes nuevos
  
INDEX idx_clients_company_phone ON clients(company_id, phone)
  Razón: Búsqueda por empresa + teléfono
```

#### **vehicles**
```sql
INDEX idx_vehicles_company_id ON vehicles(company_id)
  Razón: FK común
  
INDEX idx_vehicles_client_id ON vehicles(client_id)
  Razón: FK común, historial de vehículos
  
INDEX idx_vehicles_license_plate ON vehicles(license_plate)
  Razón: Búsqueda por placa
  
INDEX idx_vehicles_company_license_plate ON vehicles(company_id, license_plate)
  Razón: Búsqueda por empresa + placa
  
INDEX idx_vehicles_next_service_date ON vehicles(next_service_date)
  Razón: Mantenimiento programado
```

#### **service_categories**
```sql
INDEX idx_service_categories_company_id ON service_categories(company_id)
  Razón: FK común
```

#### **services**
```sql
INDEX idx_services_company_id ON services(company_id)
  Razón: FK común
  
INDEX idx_services_category_id ON services(service_category_id)
  Razón: FK común
  
INDEX idx_services_is_active ON services(is_active)
  Razón: Catálogo activo para ventas
  
INDEX idx_services_company_is_active ON services(company_id, is_active)
  Razón: Catálogo por empresa
```

#### **service_pricing**
```sql
INDEX idx_service_pricing_service_id ON service_pricing(service_id)
  Razón: FK común, obtener precios de servicio
  
INDEX idx_service_pricing_effective ON service_pricing(effective_from, effective_until)
  Razón: Cálculo de precio vigente al momento de venta
  
INDEX idx_service_pricing_active ON service_pricing(is_active, service_id)
  Razón: Precios activos de servicio
```

#### **sales**
```sql
INDEX idx_sales_company_id ON sales(company_id)
  Razón: FK común
  
INDEX idx_sales_client_id ON sales(client_id)
  Razón: FK común, historial cliente
  
INDEX idx_sales_vehicle_id ON sales(vehicle_id)
  Razón: FK común, historial vehículo
  
INDEX idx_sales_user_id ON sales(user_id)
  Razón: FK común, auditoría
  
INDEX idx_sales_sale_date ON sales(sale_date DESC)
  Razón: Reportes por fecha
  
INDEX idx_sales_company_sale_date ON sales(company_id, sale_date DESC)
  Razón: Dashboard: ventas por empresa y período
  
INDEX idx_sales_payment_status ON sales(payment_status)
  Razón: Cuentas por cobrar
  
INDEX idx_sales_company_payment_status ON sales(company_id, payment_status)
  Razón: Dashboard: pagos pendientes por empresa
  
INDEX idx_sales_created_at ON sales(created_at DESC)
  Razón: Auditoría temporal
  
INDEX idx_sales_is_cancelled ON sales(is_cancelled)
  Razón: Filtrar ventas canceladas
```

#### **sale_details**
```sql
INDEX idx_sale_details_sale_id ON sale_details(sale_id)
  Razón: FK común, obtener detalles de venta
  
INDEX idx_sale_details_service_id ON sale_details(service_id)
  Razón: FK común, análisis de servicios vendidos
```

#### **sale_payments**
```sql
INDEX idx_sale_payments_sale_id ON sale_payments(sale_id)
  Razón: FK común, historial de pagos
  
INDEX idx_sale_payments_company_id ON sale_payments(company_id)
  Razón: FK común
  
INDEX idx_sale_payments_payment_date ON sale_payments(payment_date)
  Razón: Reportes de ingresos por período
```

#### **automation_workflows**
```sql
INDEX idx_automation_workflows_company_id ON automation_workflows(company_id)
  Razón: FK común
  
INDEX idx_automation_workflows_is_active ON automation_workflows(is_active)
  Razón: Workflows activos
  
INDEX idx_automation_workflows_trigger_type ON automation_workflows(trigger_type)
  Razón: Búsqueda por tipo de trigger
```

#### **workflow_triggers**
```sql
INDEX idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id)
  Razón: FK común
  
INDEX idx_workflow_triggers_company_id ON workflow_triggers(company_id)
  Razón: FK común
  
INDEX idx_workflow_triggers_is_enabled ON workflow_triggers(is_enabled)
  Razón: Triggers activos
```

#### **workflow_executions**
```sql
INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id)
  Razón: FK común
  
INDEX idx_workflow_executions_company_id ON workflow_executions(company_id)
  Razón: FK común
  
INDEX idx_workflow_executions_status ON workflow_executions(status)
  Razón: Filtrar ejecuciones fallidas
  
INDEX idx_workflow_executions_created_at ON workflow_executions(created_at DESC)
  Razón: Historial de ejecuciones
  
INDEX idx_workflow_executions_entity ON workflow_executions(triggered_by_entity, triggered_by_entity_id)
  Razón: Buscar qué workflows afectaron una entidad
```

#### **notifications**
```sql
INDEX idx_notifications_company_id ON notifications(company_id)
  Razón: FK común
  
INDEX idx_notifications_client_id ON notifications(client_id)
  Razón: FK común, historial notificaciones
  
INDEX idx_notifications_status ON notifications(status)
  Razón: Notificaciones no entregadas
  
INDEX idx_notifications_channel ON notifications(channel)
  Razón: Reportes por canal (WhatsApp, Email)
  
INDEX idx_notifications_sent_at ON notifications(sent_at DESC)
  Razón: Historial temporal
  
INDEX idx_notifications_company_channel_status ON notifications(company_id, channel, status)
  Razón: Dashboard: tasa de entrega por canal
```

#### **audit_logs**
```sql
INDEX idx_audit_logs_company_id ON audit_logs(company_id)
  Razón: FK común
  
INDEX idx_audit_logs_user_id ON audit_logs(user_id)
  Razón: Acciones de usuario
  
INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id)
  Razón: Historial de cambios de un registro
  
INDEX idx_audit_logs_action ON audit_logs(action)
  Razón: Filtrar por tipo de acción
  
INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC)
  Razón: Ordenamiento temporal para auditoría
  
INDEX idx_audit_logs_is_sensitive ON audit_logs(is_sensitive)
  Razón: Filtrar datos sensibles (compliance)
  
INDEX idx_audit_logs_company_created_at ON audit_logs(company_id, created_at DESC)
  Razón: Auditoría por empresa en período específico
```

### 6.2. Índices Especializados

#### Para Full-Text Search (Búsqueda por texto completo)

```sql
-- Búsqueda de clientes por nombre
CREATE INDEX idx_clients_full_text ON clients 
USING GIN (to_tsvector('spanish', first_name || ' ' || COALESCE(last_name, '')));

-- Búsqueda de servicios por nombre y descripción
CREATE INDEX idx_services_full_text ON services 
USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
```

#### Para Rangos Temporales

```sql
-- Ventas en rango de fechas (usado por dashboards)
CREATE INDEX idx_sales_date_range ON sales(company_id, sale_date DESC);

-- Auditoría en rango de fechas
CREATE INDEX idx_audit_logs_date_range ON audit_logs(company_id, created_at DESC);
```

---

## 7. Arquitectura Multiempresa SaaS

### 7.1. Estrategia de Aislamiento de Datos

Para soportar múltiples empresas sin rediseñar la base de datos:

```
PRINCIPIO FUNDAMENTAL:
Toda tabla operativa (excepto companies, roles base) contiene:
  ├─ company_id (FK → companies)
  └─ Garantiza aislamiento lógico de datos
```

### 7.2. Estructura de Datos Multiempresa

```
┌─────────────────────────────────────────────────────────┐
│              APLICACIÓN SaaS - BIA PLATFORM              │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  EMPRESAS (companies)                                        │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │  Empresa A      │  │  Empresa B      │  │  Empresa C      │
│  │ (Lavadero 1)    │  │ (Lavadero 2)    │  │ (Taller Autos)  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘
│
├─ company_id: uuid-1234  ├─ company_id: uuid-5678  ├─ company_id: uuid-9012
│
├─ users (isolados)       ├─ users (isolados)       ├─ users (isolados)
├─ clients (isolados)     ├─ clients (isolados)     ├─ clients (isolados)
├─ vehicles (isolados)    ├─ vehicles (isolados)    ├─ vehicles (isolados)
├─ sales (isolados)       ├─ sales (isolados)       ├─ sales (isolados)
├─ roles (propios)        ├─ roles (propios)        ├─ roles (propios)
└─ workflows (propios)    └─ workflows (propios)    └─ workflows (propios)
```

### 7.3. Relaciones Multiempresa

#### **users → companies**

```sql
-- Un usuario pertenece a UNA empresa
-- Pero puede ser propietario/admin de múltiples empresas
-- (Casos avanzados futuros)

ALTER TABLE users ADD COLUMN owner_of_companies UUID[] DEFAULT '{}';
-- Array de empresas que administra (para SaaS Enterprise)
```

#### **clients → companies**

```sql
-- Cada cliente pertenece a UNA empresa
-- No puede haber "cliente compartido" entre empresas

ALTER TABLE clients ADD CONSTRAINT 
  UNIQUE(company_id, email) 
  WHERE deleted_at IS NULL;
```

#### **sales → companies**

```sql
-- Cada venta pertenece a UNA empresa
-- Datos completamente aislados

ALTER TABLE sales ADD CONSTRAINT 
  UNIQUE(company_id, sale_number) 
  WHERE deleted_at IS NULL;
```

### 7.4. Migración de Monolítico a SaaS

**Fase Inicial (MVP - Empresa Única):**
```sql
-- Insertar una empresa por defecto
INSERT INTO companies (name, slug, subscription_tier)
VALUES ('Mi Lavadero', 'mi-lavadero', 'pro');

-- Todos los users, clients, sales heredan este company_id
```

**Fase 2 (Soporte Multiempresa):**
```sql
-- Agregar nueva empresa
INSERT INTO companies (name, slug, subscription_tier)
VALUES ('Nuevo Negocio', 'nuevo-negocio', 'basic');

-- Usuarios del nuevo negocio se asocian al nuevo company_id
-- Sus datos quedan completamente aislados
```

### 7.5. RLS para Aislamiento Multiempresa

```sql
-- Política de seguridad: Usuario solo ve datos de su empresa

CREATE POLICY "Users can only see their company's clients"
ON clients
FOR SELECT
USING (company_id = current_user_company_id());

CREATE POLICY "Users can only create clients for their company"
ON clients
FOR INSERT
WITH CHECK (company_id = current_user_company_id());
```

---

## 8. Sistema de Auditoría

### 8.1. Requisitos de Auditoría

```
DEBE REGISTRAR:
├─ Quién realizó la acción (user_id)
├─ Cuándo (created_at)
├─ Qué tabla/registro fue afectado
├─ Qué cambios se realizaron (old_values, new_values)
├─ Dónde (ip_address, user_agent)
├─ Por qué (para eventos manuales, el sistema puede inferirlo)
└─ Está marcado como sensible si incluye datos críticos
```

### 8.2. Estructura audit_logs

```
audit_logs
├── id: UUID
├── company_id: UUID (FK)
├── user_id: UUID (FK) [NULL si fue acción automática]
├── action: VARCHAR(100) [CREATE|UPDATE|DELETE|VIEW|EXPORT]
├── entity_type: VARCHAR(100) [clients|sales|vehicles|services]
├── entity_id: UUID
├── old_values: JSONB [Estado anterior]
├── new_values: JSONB [Estado actual]
├── ip_address: VARCHAR(50)
├── user_agent: TEXT
├── changes_summary: TEXT [Resumen legible]
├── is_sensitive: BOOLEAN [Datos críticos/sensibles]
├── created_by_system: BOOLEAN [true si fue automático]
└── created_at: TIMESTAMP
```

### 8.3. Disparadores (Triggers) para Auditoría

```sql
-- Ejemplo de trigger para auditar INSERT en clients

CREATE OR REPLACE FUNCTION audit_clients_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    action,
    entity_type,
    entity_id,
    new_values,
    changes_summary,
    is_sensitive,
    created_by_system
  ) VALUES (
    NEW.company_id,
    current_user_id(), -- Function helper
    'CREATE',
    'clients',
    NEW.id,
    row_to_json(NEW),
    'Cliente creado: ' || NEW.first_name || ' ' || NEW.last_name,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_clients_insert
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION audit_clients_insert();


-- Ejemplo de trigger para auditar UPDATE en clients

CREATE OR REPLACE FUNCTION audit_clients_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    changes_summary,
    is_sensitive,
    created_by_system
  ) VALUES (
    NEW.company_id,
    current_user_id(),
    'UPDATE',
    'clients',
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW),
    'Cliente actualizado: ' || NEW.first_name,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_clients_update
AFTER UPDATE ON clients
FOR EACH ROW
WHEN (OLD IS DISTINCT FROM NEW)
EXECUTE FUNCTION audit_clients_update();


-- Ejemplo de trigger para auditar DELETE (soft delete)

CREATE OR REPLACE FUNCTION audit_clients_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    changes_summary,
    is_sensitive,
    created_by_system
  ) VALUES (
    OLD.company_id,
    current_user_id(),
    'DELETE',
    'clients',
    OLD.id,
    row_to_json(OLD),
    'Cliente eliminado: ' || OLD.first_name,
    true, -- Sensible
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_clients_delete
AFTER UPDATE ON clients
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION audit_clients_delete();
```

### 8.4. Queries de Auditoría

```sql
-- Ver todas las acciones en un cliente
SELECT * FROM audit_logs 
WHERE entity_type = 'clients' 
AND entity_id = 'client-uuid'
ORDER BY created_at DESC;

-- Ver qué cambió en una transacción
SELECT 
  user_id,
  action,
  old_values,
  new_values,
  changes_summary,
  created_at
FROM audit_logs
WHERE entity_type = 'sales'
AND entity_id = 'sale-uuid'
ORDER BY created_at DESC;

-- Auditoría de un usuario específico
SELECT * FROM audit_logs 
WHERE user_id = 'user-uuid'
AND is_sensitive = false
ORDER BY created_at DESC
LIMIT 100;

-- Detectar cambios no autorizados
SELECT * FROM audit_logs
WHERE is_sensitive = true
AND created_by_system = false
ORDER BY created_at DESC;
```

---

## 9. Automatizaciones y Notificaciones

### 9.1. Flujo de Automatizaciones

```
EVENT TRIGGER (en BD)
        │
        ↓
┌─────────────────────────────────────┐
│  Identificar Workflow Aplicable      │
│  (client_created, inactivity, etc)   │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Crear workflow_execution record     │
│  (status: pending)                   │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Enviar a n8n (webhook/API)          │
│  Payload: { workflow_id, data }      │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  n8n Ejecuta Workflow                │
│  - Valida condiciones                │
│  - Formatea mensaje                  │
│  - Llama Evolution API / WhatsApp    │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Registrar Notificación              │
│  (notifications table)               │
│  Status: sent, delivered, read       │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Actualizar workflow_execution       │
│  Status: success/failed              │
│  Guardar response de n8n             │
└─────────────────────────────────────┘
```

### 9.2. Workflows Principales

#### **Workflow 1: Bienvenida (client_created)**

```sql
INSERT INTO automation_workflows (
  company_id,
  name,
  workflow_type,
  trigger_type,
  is_active,
  n8n_workflow_id
) VALUES (
  'company-uuid',
  'Bienvenida de Cliente Nuevo',
  'welcome',
  'client_created',
  true,
  'n8n-workflow-id-123'
);

-- Trigger: Cuando se inserta en clients
-- Condición: client_status_id = 'Nuevo'
-- Acción: Enviar mensaje WhatsApp de bienvenida
```

#### **Workflow 2: Recuperación (inactivity)**

```sql
INSERT INTO automation_workflows (
  company_id,
  name,
  workflow_type,
  trigger_type,
  trigger_condition,
  is_active,
  n8n_workflow_id
) VALUES (
  'company-uuid',
  'Recuperación de Clientes Inactivos',
  'recovery',
  'inactivity',
  '{"days_inactive": 60}',
  true,
  'n8n-workflow-id-456'
);

-- Trigger: Ejecutada por cron job
-- Condición: last_purchase_date < 60 días atrás
-- Acción: Enviar mensaje de recuperación
-- Efecto: Cambiar client_status a 'Inactivo'
```

#### **Workflow 3: Promociones (sales_milestone)**

```sql
INSERT INTO automation_workflows (
  company_id,
  name,
  workflow_type,
  trigger_type,
  trigger_condition,
  is_active
) VALUES (
  'company-uuid',
  'Promoción por Compra Anterior',
  'promotion',
  'sales_milestone',
  '{"after_purchases": 5, "discount": 10}',
  true
);

-- Trigger: Después de registrar una venta
-- Condición: Si total_purchases >= 5
-- Acción: Enviar código de descuento
```

#### **Workflow 4: Cumpleaños (birthday)**

```sql
INSERT INTO automation_workflows (
  company_id,
  name,
  workflow_type,
  trigger_type,
  is_active
) VALUES (
  'company-uuid',
  'Felicitación de Cumpleaños',
  'birthday',
  'birthday',
  true
);

-- Trigger: Cron job diario
-- Condición: date_of_birth = HOY
-- Acción: Enviar mensaje de felicitación con oferta
```

### 9.3. Estructura de Notificaciones

```
notifications
├── channel: whatsapp, email, sms
├── status: sent, delivered, read, failed, bounced
├── external_message_id: ID de WhatsApp/Provider
├── tracking:
│   ├── sent_at
│   ├── delivered_at
│   ├── read_at
│   └── error_reason
└── retry_logic:
    ├── retry_count (max 3)
    ├── exponential backoff
    └── status = 'failed' si max retries alcanzado
```

---

## 10. Seguridad y Row Level Security

### 10.1. Autenticación (Supabase Auth)

```
FLUJO DE AUTENTICACIÓN:
├─ Usuario ingresa credentials
├─ Supabase verifica contra auth.users
├─ Si válido, emite JWT con claims
├─ JWT incluye: user_id, company_id, roles, permisos
└─ Backend valida JWT en cada request
```

### 10.2. Row Level Security (RLS) Políticas

#### **Tabla: users**

```sql
-- Los usuarios solo ven usuarios de su propia empresa
CREATE POLICY "Users see only their company users"
ON users FOR SELECT
USING (company_id = current_user_company_id());

-- Los usuarios no pueden insertarse a sí mismos
CREATE POLICY "Only admins can create users"
ON users FOR INSERT
WITH CHECK (
  current_user_company_id() = company_id
  AND current_user_has_role('admin')
);

-- Los usuarios solo pueden actualizar su propio perfil
-- o si son admins
CREATE POLICY "Users update only themselves or admins can update"
ON users FOR UPDATE
USING (
  id = current_user_id() 
  OR current_user_has_role('admin')
);
```

#### **Tabla: clients**

```sql
-- Solo ver clientes de su empresa
CREATE POLICY "Users see clients from their company only"
ON clients FOR SELECT
USING (company_id = current_user_company_id());

-- Solo empleados/admins pueden crear clientes
CREATE POLICY "Employees and admins create clients"
ON clients FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee') 
    OR current_user_has_role('admin')
  )
);

-- Empleados/admins pueden actualizar clientes de su empresa
CREATE POLICY "Employees and admins update company clients"
ON clients FOR UPDATE
USING (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee')
    OR current_user_has_role('admin')
  )
);

-- Solo admins pueden eliminar (soft delete)
CREATE POLICY "Only admins can delete clients"
ON clients FOR UPDATE
USING (company_id = current_user_company_id() AND current_user_has_role('admin'))
WITH CHECK (deleted_at IS NOT NULL);
```

#### **Tabla: sales**

```sql
-- Solo ver ventas de su empresa
CREATE POLICY "Users see sales from their company only"
ON sales FOR SELECT
USING (company_id = current_user_company_id());

-- Solo empleados/admins pueden registrar ventas
CREATE POLICY "Employees and admins create sales"
ON sales FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee')
    OR current_user_has_role('admin')
  )
);

-- Crear el usuario que registró la venta (en server actions)
CREATE POLICY "Employees see their sales"
ON sales FOR UPDATE
USING (
  company_id = current_user_company_id()
  AND user_id = current_user_id()
);

-- Solo admins pueden cancelar ventas
CREATE POLICY "Only admins can cancel sales"
ON sales FOR UPDATE
USING (
  company_id = current_user_company_id()
  AND current_user_has_role('admin')
  AND is_cancelled = true
);
```

#### **Tabla: audit_logs**

```sql
-- Solo admins ven auditoría
CREATE POLICY "Only admins see audit logs"
ON audit_logs FOR SELECT
USING (
  company_id = current_user_company_id()
  AND current_user_has_role('admin')
);

-- Nadie puede actualizar auditoría (append-only)
CREATE POLICY "Audit logs are read-only"
ON audit_logs FOR UPDATE
USING (false);

-- Nadie puede borrar auditoría
CREATE POLICY "Audit logs cannot be deleted"
ON audit_logs FOR DELETE
USING (false);
```

### 10.3. Funciones Helper para RLS

```sql
-- Obtener company_id del usuario actual
CREATE OR REPLACE FUNCTION current_user_company_id() RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'company_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Obtener user_id actual
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'sub')::UUID;
$$ LANGUAGE SQL STABLE;

-- Verificar si usuario tiene rol específico
CREATE OR REPLACE FUNCTION current_user_has_role(role_name VARCHAR) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = current_user_id()
    AND r.name = role_name
    AND r.company_id = current_user_company_id()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Obtener todos los permisos del usuario
CREATE OR REPLACE FUNCTION current_user_permissions() RETURNS JSONB AS $$
  SELECT jsonb_agg(r.permissions)
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = current_user_id()
  AND r.company_id = current_user_company_id();
$$ LANGUAGE SQL STABLE;
```

### 10.4. Ejemplo JWT con Claims

```json
{
  "sub": "user-uuid-1234",
  "email": "empleado@empresa.com",
  "company_id": "company-uuid-5678",
  "roles": ["employee"],
  "permissions": [
    "clients:create",
    "clients:read",
    "sales:create",
    "sales:read"
  ],
  "iat": 1718654400,
  "exp": 1718740800
}
```

### 10.5. Protecciones Adicionales

#### **CSRF Protection**
```typescript
// En Server Actions (Next.js), se valida automáticamente
// Con SameSite Cookies + CSRF tokens
```

#### **XSS Protection**
```typescript
// DOMPurify en inputs
// Sanitización de output en componentes React
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

#### **SQL Injection Prevention**
```sql
-- PostgreSQL + Supabase previene nativamente
-- Parametrized Queries garantizan seguridad
PREPARE stmt AS 
  SELECT * FROM clients 
  WHERE company_id = $1 AND id = $2;

EXECUTE stmt ('company-uuid', 'client-uuid');
```

#### **Validación Backend (Zod + TypeScript)**
```typescript
// Todo input validado en Server Actions
import { z } from 'zod';

const CreateClientSchema = z.object({
  first_name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
});

export async function createClient(data: unknown) {
  const validated = CreateClientSchema.parse(data);
  // Solo validated entra a la base de datos
}
```

---

## 11. Diagrama Textual Completo

### 11.1. Relaciones Entidad-Relación

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE BASE DE DATOS BIA PLATFORM             │
└───────────────────────────────────────────────────────────────────────────┘

CAPA 1: AUTENTICACIÓN Y ACCESO
═══════════════════════════════════════════════════════════════════════════

    ┌─────────────────┐
    │   companies     │
    │  (multiempresa) │
    │   - id (PK)     │
    │   - name        │
    │   - slug        │
    │   - tier        │
    └────────┬────────┘
             │
             ├─────────────────┬─────────────────┬──────────────────┐
             ▼                 ▼                 ▼                  ▼
        ┌─────────┐       ┌────────┐       ┌────────┐        ┌──────────┐
        │  users  │       │ roles  │       │clients │        │vehicles  │
        ├─────────┤       ├────────┤       ├────────┤        ├──────────┤
        │ id (PK) │       │id (PK) │       │id (PK)│        │id (PK)   │
        │company❯ │       │company❯│       │company❯│        │company❯  │
        │email    │       │name    │       │first   │        │client❯   │
        │name     │       │perms   │       │phone   │        │plate     │
        │auth_prov│       │        │       │email   │        │make      │
        └────┬────┘       └────┬───┘       │status❯ │        │model     │
             │ M2M             │           │LTV     │        │year      │
             │                 │           │email   │        └──────────┘
        ┌────┴──────┐          │           └─┬──────┘
        │user_roles │◄─────────┘             │
        ├───────────┤                        └────────┬─────────────┐
        │user❯      │                                 ▼             ▼
        │role❯      │                          ┌──────────────┐  ┌──────────┐
        └───────────┘                          │client_status │  │ (sales)  │
                                               │- id (PK)     │  │  linked  │
                                               │- name        │  │   via    │
                                               │- color       │  │  vehicle │
                                               └──────────────┘  │   (1:N)  │
                                                                  └──────────┘

CAPA 2: GESTIÓN OPERATIVA
═══════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────────────────────────────┐
    │  SERVICIOS Y CATÁLOGOS                                       │
    └──────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │service_categories   │
    │  - id (PK)          │
    │  - company❯         │
    │  - name             │
    │  - icon             │
    └──────────┬──────────┘
               │ (1:N)
               ▼
    ┌─────────────────────┐                    ┌──────────────────┐
    │    services         │────────────────────►│service_pricing   │
    │  - id (PK)          │ (1:N)               │  - id (PK)       │
    │  - company❯         │                     │  - service❯      │
    │  - category❯        │                     │  - price         │
    │  - name             │                     │  - discount%     │
    │  - base_price       │                     │  - from_date     │
    │  - tax_rate         │                     │  - until_date    │
    │  - requires_vehicle │                     │  - is_active     │
    └─────────────────────┘                     └──────────────────┘

CAPA 3: TRANSACCIONES (NÚCLEO - Atomicidad Garantizada)
═══════════════════════════════════════════════════════════════════════════

    ┌─────────────────────┐
    │     sales           │  ◄─── TRANSACCIÓN PRINCIPAL (1:1 con operación)
    │  - id (PK)          │
    │  - company❯         │
    │  - client❯          │
    │  - vehicle❯ (opt)   │
    │  - user❯            │
    │  - sale_number      │
    │  - sale_date        │
    │  - subtotal         │
    │  - tax_amount       │
    │  - total_amount     │
    │  - discount         │
    │  - payment_status   │
    │  - is_cancelled     │
    │  - cancelled_by❯    │
    └────────┬────────────┘
             │
             ├─────────────────────┬────────────────────┐
             │ (1:N)               │ (1:N)              │
             ▼                     ▼                    ▼
    ┌──────────────────┐   ┌──────────────────┐   ┌───────────────┐
    │  sale_details    │   │  sale_payments   │   │ (audit logs)  │
    │ - id (PK)        │   │ - id (PK)        │   │   (tracked)   │
    │ - sale❯          │   │ - sale❯          │   │               │
    │ - service❯       │   │ - amount         │   │               │
    │ - quantity       │   │ - method         │   │               │
    │ - unit_price     │   │ - ref            │   │               │
    │ - discount       │   │ - date           │   │               │
    │ - tax_amount     │   │ - processed_by❯  │   │               │
    │ - subtotal       │   │                  │   │               │
    └──────────────────┘   └──────────────────┘   └───────────────┘

CAPA 4: AUTOMATIZACIÓN Y NOTIFICACIONES (n8n Integration)
═══════════════════════════════════════════════════════════════════════════

    ┌────────────────────────────┐
    │ automation_workflows        │
    │ - id (PK)                  │
    │ - company❯                 │
    │ - name                     │
    │ - type (welcome|recovery..)│
    │ - trigger_type             │
    │ - trigger_condition (JSON) │
    │ - n8n_workflow_id          │
    │ - is_active                │
    │ - execution_count          │
    └────────┬───────────────────┘
             │
             ├──────────────────────────┬──────────────────────┐
             │ (1:N)                    │ (1:N)                │
             ▼                          ▼                      ▼
    ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────┐
    │workflow_triggers     │   │workflow_executions   │   │notifications   │
    │ - id (PK)            │   │ - id (PK)            │   │ - id (PK)      │
    │ - workflow❯          │   │ - workflow❯          │   │ - company❯     │
    │ - trigger_event      │   │ - trigger❯ (opt)     │   │ - client❯      │
    │ - event_data (JSON)  │   │ - entity_type        │   │ - workflow_exec│
    │ - is_enabled         │   │ - entity_id          │   │ - type         │
    │                      │   │ - status (pending..) │   │ - channel      │
    │                      │   │ - n8n_execution_id   │   │ - recipient_*  │
    │                      │   │ - error_message      │   │ - message      │
    │                      │   │ - retry_count        │   │ - status       │
    │                      │   │ - response_data      │   │ - external_id  │
    │                      │   │ - executed_at        │   │ - sent_at      │
    │                      │   │                      │   │ - delivered_at │
    │                      │   │                      │   │ - read_at      │
    │                      │   │                      │   │ - error_reason │
    └──────────────────────┘   └──────────────────────┘   └────────────────┘
                                        ▲
                                        │
                                 TRIGGER DISPARA:
                            - client INSERT (welcome)
                            - 60 días inactividad (recovery)
                            - 5+ compras (promotion)
                            - birthday date (birthday)


CAPA 5: AUDITORÍA Y COMPLIANCE
═══════════════════════════════════════════════════════════════════════════

    ┌───────────────────────────────────────────────────────────┐
    │              audit_logs (Append-Only)                     │
    │  ┌───────────────────────────────────────────────────────┐│
    │  │ - id (PK)                                             ││
    │  │ - company❯                                            ││
    │  │ - user❯ (NULL si automático)                          ││
    │  │ - action (CREATE|UPDATE|DELETE|VIEW|EXPORT)          ││
    │  │ - entity_type                                         ││
    │  │ - entity_id                                           ││
    │  │ - old_values (JSONB)                                  ││
    │  │ - new_values (JSONB)                                  ││
    │  │ - ip_address                                          ││
    │  │ - user_agent                                          ││
    │  │ - changes_summary                                     ││
    │  │ - is_sensitive (BOOL)                                 ││
    │  │ - created_by_system (BOOL)                            ││
    │  │ - created_at (INDEXED)                                ││
    │  │                                                       ││
    │  │ POLÍTICAS RLS:                                        ││
    │  │ ├─ SELECT: Solo admins de la empresa                  ││
    │  │ ├─ INSERT: Automático via triggers                    ││
    │  │ ├─ UPDATE: NUNCA (append-only)                        ││
    │  │ └─ DELETE: NUNCA (immutable)                          ││
    │  └───────────────────────────────────────────────────────┘│
    └───────────────────────────────────────────────────────────┘


RELACIONES RESUMIDAS
═══════════════════════════════════════════════════════════════════════════

companies (1) ────────────────────────────── (N) users
                                                 (N) roles
                                                 (N) clients
                                                 (N) vehicles
                                                 (N) services
                                                 (N) sales
                                                 (N) workflows
                                                 (N) audit_logs

clients (1) ──────────────────────────────── (N) vehicles
            ──────────────────────────────── (N) sales

vehicles (1) ───────────────────────────────(N) sales

sales (1) ─────────────────────────────────(N) sale_details
         ───────────────────────────────(N) sale_payments

services (1) ──────────────────────────────(N) sale_details
            ──────────────────────────────(N) service_pricing

service_categories (1) ────────────────────(N) services

automation_workflows (1) ──────────────────(N) workflow_triggers
                         ──────────────────(N) workflow_executions

workflow_executions (1) ───────────────────(N) notifications

clients (1) ────────────────────────────────(N) notifications

users (N) ◄─────────M2M─────────► (N) roles
          MEDIANTE: user_roles
```

---

## 12. Próximas Fases (Roadmap)

### 12.1. Extensiones Futuras

```
FASE 2: MULTIEMPRESA COMPLETA
├─ Soporte de múltiples empresas simultáneamente
├─ Facturación y billing
├─ Customización de UI por empresa
└─ SLA contracts por empresa

FASE 3: INTELIGENCIA DE NEGOCIO
├─ Vistas materializadas para reportes
├─ Data warehouse separado
├─ Algoritmos de predicción (churn, LTV)
└─ Recomendaciones personalizadas

FASE 4: EXTENSIONES VERTICALES
├─ Soporte para otros tipos de negocio (no solo lavaderos)
├─ Workflow templates customizables
├─ Integraciones con ERPs
└─ APIs públicas para partners
```

---

**Fin del Documento**  
Versión: 1.0 | Fecha: 2026-06-17 | Estado: Listo para Implementación

