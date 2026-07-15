-- ============================================================================
-- BIA PLATFORM - SQL ESTRUCTURA LIMPIA (SIN DATOS DEMO)
-- ============================================================================
-- Versión: 1.0 - Producción
-- Fecha: 2026-07-15
-- Propósito: SOLO estructura de base de datos (sin datos iniciales)
-- Flujo: Todo se crea desde la página web en tiempo real
-- 
-- INSTRUCCIONES:
-- 1. Copia CADA PASO por separado en Supabase SQL Editor
-- 2. Ejecuta en orden (PASO 1 → PASO 7)
-- 3. Verifica cada ejecución antes de continuar
-- 4. Al final: Tendrás BD vacía lista para usar
-- ============================================================================

-- ============================================================================
-- PASO 1: EXTENSIONES REQUERIDAS
-- ============================================================================
-- Tiempo: <1 segundo
-- Copiar y pegar TODO esto en Supabase SQL Editor
-- Ejecutar una sola vez

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ✅ Verificar que se crearon:
-- SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
-- Deberías ver 2 filas

-- ============================================================================
-- PASO 2: ENUMERACIONES Y TIPOS CUSTOMIZADOS
-- ============================================================================
-- Tiempo: 2 segundos
-- Copiar y pegar TODO esto
-- NO habrá cambios de tipos, solo creación

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

-- ✅ Verificar que se crearon:
-- SELECT typname FROM pg_type WHERE typname IN ('subscription_tier', 'auth_provider_type', 'client_gender');
-- Deberías ver varios tipos listados

-- ============================================================================
-- PASO 3: CREAR TABLAS
-- ============================================================================
-- Tiempo: 5 segundos
-- TABLA 1: companies (Multiempresa SaaS)

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE GENERATED ALWAYS AS (LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9-]', '-', 'g'))) STORED,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- TABLA 2: users (Usuarios del sistema)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  auth_provider auth_provider_type NOT NULL DEFAULT 'supabase',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- TABLA 3: roles (Definición de roles)

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name role_name_type NOT NULL,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(company_id, name)
);

-- TABLA 4: user_roles (Relación M:N usuarios-roles)

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(user_id, role_id)
);

-- TABLA 5: client_status (Estados de cliente - SOLO ESTRUCTURA, SIN DATOS)

CREATE TABLE IF NOT EXISTS client_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color_code VARCHAR(7) DEFAULT '#000000',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 6: clients (Clientes del negocio)

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  phone_alt VARCHAR(20),
  date_of_birth DATE,
  gender client_gender,
  document_type document_type,
  document_number VARCHAR(50),
  address VARCHAR(500),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  client_status_id UUID NOT NULL REFERENCES client_status(id) ON DELETE RESTRICT,
  total_purchases DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (total_purchases >= 0),
  lifetime_value DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (lifetime_value >= 0),
  last_purchase_date TIMESTAMP,
  notes TEXT,
  preferred_contact contact_preference NOT NULL DEFAULT 'phone',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_clients_company_email_not_deleted ON clients(company_id, email) WHERE deleted_at IS NULL AND email IS NOT NULL;

-- TABLA 7: vehicles (Vehículos de clientes)

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  vin VARCHAR(50),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  color VARCHAR(50),
  vehicle_type vehicle_type,
  fuel_type fuel_type,
  registration_date DATE,
  last_service_date TIMESTAMP,
  next_service_date TIMESTAMP,
  mileage_km INTEGER CHECK (mileage_km IS NULL OR mileage_km >= 0),
  service_history_count INTEGER NOT NULL DEFAULT 0 CHECK (service_history_count >= 0),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicles_company_license_plate_not_deleted ON vehicles(company_id, license_plate) WHERE deleted_at IS NULL;

-- TABLA 8: service_categories (Categorías de servicios)

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_code VARCHAR(50),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, name)
);

-- TABLA 9: services (Catálogo maestro de servicios)

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(15,2) NOT NULL CHECK (base_price > 0),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_service BOOLEAN NOT NULL DEFAULT true,
  requires_vehicle BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- TABLA 10: service_pricing (Precios dinámicos)

CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  price DECIMAL(15,2) NOT NULL CHECK (price > 0),
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  effective_from TIMESTAMP NOT NULL,
  effective_until TIMESTAMP,
  priority INTEGER NOT NULL DEFAULT 0,
  reason VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 11: sales (Encabezado de venta - NÚCLEO TRANSACCIONAL)

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  sale_number VARCHAR(50) NOT NULL,
  sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(15,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  discount_type discount_type,
  discount_reason VARCHAR(255),
  payment_method payment_method_type NOT NULL DEFAULT 'cash',
  payment_status payment_status_type NOT NULL DEFAULT 'pending',
  notes TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_sales_company_sale_number_not_deleted ON sales(company_id, sale_number) WHERE deleted_at IS NULL;

-- TABLA 12: sale_details (Detalles atómicos de venta)

CREATE TABLE IF NOT EXISTS sale_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price > 0),
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  subtotal DECIMAL(15,2) NOT NULL CHECK (subtotal >= 0),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 13: sale_payments (Registro de pagos)

CREATE TABLE IF NOT EXISTS sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payment_method payment_method_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  reference VARCHAR(255),
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 14: automation_workflows (Workflows de automatización)

CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_type workflow_type NOT NULL DEFAULT 'custom',
  trigger_type trigger_type NOT NULL,
  trigger_condition JSONB,
  n8n_workflow_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT false,
  execution_count INTEGER NOT NULL DEFAULT 0 CHECK (execution_count >= 0),
  last_execution_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- TABLA 15: workflow_triggers (Configuración de triggers)

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trigger_event VARCHAR(100) NOT NULL,
  event_data JSONB,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, trigger_event)
);

-- TABLA 16: workflow_executions (Registro de ejecuciones)

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES workflow_triggers(id) ON DELETE SET NULL,
  triggered_by_entity VARCHAR(100) NOT NULL,
  triggered_by_entity_id UUID NOT NULL,
  status execution_status NOT NULL DEFAULT 'pending',
  n8n_execution_id VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  response_data JSONB,
  executed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 17: notifications (Log de notificaciones enviadas)

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  recipient_number VARCHAR(20),
  message_content TEXT NOT NULL,
  message_template_id VARCHAR(255),
  status notification_status NOT NULL DEFAULT 'sent',
  external_message_id VARCHAR(255),
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 18: audit_logs (Sistema de auditoría - Append-Only)

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action audit_action_type NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  changes_summary TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_by_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Verificar que se crearon 18 tablas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Deberías ver 18 tablas listadas

-- ============================================================================
-- PASO 4: CREAR ÍNDICES (OPTIMIZACIÓN)
-- ============================================================================
-- Tiempo: 3 segundos
-- Mejora performance de queries sin datos aún

-- companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- users
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id_is_active ON users(company_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC);

-- roles
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_company_status ON clients(company_id, client_status_id);
CREATE INDEX IF NOT EXISTS idx_clients_last_purchase_date ON clients(last_purchase_date DESC) WHERE last_purchase_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_date_of_birth ON clients(date_of_birth) WHERE date_of_birth IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_full_text ON clients USING GIN (to_tsvector('spanish', first_name || ' ' || COALESCE(last_name, '')));

-- vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_license_plate ON vehicles(company_id, license_plate) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service_date ON vehicles(next_service_date) WHERE next_service_date IS NOT NULL;

-- service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_company_id ON service_categories(company_id);

-- services
CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(service_category_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_company_is_active ON services(company_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_full_text ON services USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- service_pricing
CREATE INDEX IF NOT EXISTS idx_service_pricing_service_id ON service_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_effective ON service_pricing(effective_from, effective_until) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_pricing_active ON service_pricing(is_active, service_id) WHERE is_active = true;

-- sales
CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales(vehicle_id) WHERE vehicle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_company_sale_date ON sales(company_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_company_payment_status ON sales(company_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_is_cancelled ON sales(is_cancelled) WHERE is_cancelled = true;

-- sale_details
CREATE INDEX IF NOT EXISTS idx_sale_details_sale_id ON sale_details(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_details_service_id ON sale_details(service_id);

-- sale_payments
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_company_id ON sale_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_payment_date ON sale_payments(payment_date DESC);

-- automation_workflows
CREATE INDEX IF NOT EXISTS idx_automation_workflows_company_id ON automation_workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_is_active ON automation_workflows(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger_type ON automation_workflows(trigger_type);

-- workflow_triggers
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_company_id ON workflow_triggers(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_is_enabled ON workflow_triggers(is_enabled) WHERE is_enabled = true;

-- workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_company_id ON workflow_executions(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_entity ON workflow_executions(triggered_by_entity, triggered_by_entity_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_company_channel_status ON notifications(company_id, channel, status);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_is_sensitive ON audit_logs(is_sensitive) WHERE is_sensitive = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created_at ON audit_logs(company_id, created_at DESC);

-- ============================================================================
-- PASO 5: TRIGGERS Y FUNCIONES DE AUDITORÍA
-- ============================================================================
-- Tiempo: 2 segundos
-- Funciones para JWT, roles y auditoría automática

-- Función para obtener company_id del usuario actual (JWT)
CREATE OR REPLACE FUNCTION current_user_company_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_company_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Función para obtener user_id actual
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Función para verificar si usuario tiene rol específico
CREATE OR REPLACE FUNCTION current_user_has_role(role_name role_name_type) 
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

-- ============================================================================
-- TRIGGERS DE AUDITORÍA
-- ============================================================================

-- Trigger para auditar INSERT en clients
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
    current_user_id(),
    'CREATE'::audit_action_type,
    'clients',
    NEW.id,
    row_to_json(NEW),
    'Cliente creado: ' || NEW.first_name || ' ' || COALESCE(NEW.last_name, ''),
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_clients_insert ON clients;
CREATE TRIGGER trigger_audit_clients_insert
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION audit_clients_insert();

-- Trigger para auditar UPDATE en clients
CREATE OR REPLACE FUNCTION audit_clients_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD IS DISTINCT FROM NEW THEN
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
      'UPDATE'::audit_action_type,
      'clients',
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      'Cliente actualizado: ' || NEW.first_name,
      false,
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_clients_update ON clients;
CREATE TRIGGER trigger_audit_clients_update
AFTER UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION audit_clients_update();

-- Trigger para auditar DELETE (soft delete) en clients
CREATE OR REPLACE FUNCTION audit_clients_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
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
      'DELETE'::audit_action_type,
      'clients',
      OLD.id,
      row_to_json(OLD),
      'Cliente eliminado (soft delete): ' || OLD.first_name,
      true,
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_clients_delete ON clients;
CREATE TRIGGER trigger_audit_clients_delete
AFTER UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION audit_clients_delete();

-- Trigger para auditar INSERT en sales
CREATE OR REPLACE FUNCTION audit_sales_insert()
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
    NEW.user_id,
    'CREATE'::audit_action_type,
    'sales',
    NEW.id,
    row_to_json(NEW),
    'Venta registrada: ' || NEW.sale_number || ' - Total: $' || NEW.total_amount,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_sales_insert ON sales;
CREATE TRIGGER trigger_audit_sales_insert
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION audit_sales_insert();

-- Trigger para auditar UPDATE en sales
CREATE OR REPLACE FUNCTION audit_sales_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD IS DISTINCT FROM NEW THEN
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
      COALESCE(NEW.cancelled_by, current_user_id()),
      'UPDATE'::audit_action_type,
      'sales',
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      CASE 
        WHEN NEW.is_cancelled AND NOT OLD.is_cancelled THEN 'Venta cancelada: ' || NEW.sale_number || ' - Motivo: ' || COALESCE(NEW.cancellation_reason, 'Sin especificar')
        ELSE 'Venta actualizada: ' || NEW.sale_number
      END,
      false,
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_sales_update ON sales;
CREATE TRIGGER trigger_audit_sales_update
AFTER UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION audit_sales_update();

-- Trigger para auditar INSERT en vehicles
CREATE OR REPLACE FUNCTION audit_vehicles_insert()
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
    NEW.created_by,
    'CREATE'::audit_action_type,
    'vehicles',
    NEW.id,
    row_to_json(NEW),
    'Vehículo registrado: ' || NEW.make || ' ' || NEW.model || ' (' || NEW.license_plate || ')',
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_vehicles_insert ON vehicles;
CREATE TRIGGER trigger_audit_vehicles_insert
AFTER INSERT ON vehicles
FOR EACH ROW
EXECUTE FUNCTION audit_vehicles_insert();

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de timestamp a todas las tablas
DROP TRIGGER IF EXISTS trigger_update_timestamp_companies ON companies;
CREATE TRIGGER trigger_update_timestamp_companies BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_users ON users;
CREATE TRIGGER trigger_update_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_roles ON roles;
CREATE TRIGGER trigger_update_timestamp_roles BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_clients ON clients;
CREATE TRIGGER trigger_update_timestamp_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_vehicles ON vehicles;
CREATE TRIGGER trigger_update_timestamp_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_service_categories ON service_categories;
CREATE TRIGGER trigger_update_timestamp_service_categories BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_services ON services;
CREATE TRIGGER trigger_update_timestamp_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_service_pricing ON service_pricing;
CREATE TRIGGER trigger_update_timestamp_service_pricing BEFORE UPDATE ON service_pricing FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_sales ON sales;
CREATE TRIGGER trigger_update_timestamp_sales BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_sale_details ON sale_details;
CREATE TRIGGER trigger_update_timestamp_sale_details BEFORE UPDATE ON sale_details FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_sale_payments ON sale_payments;
CREATE TRIGGER trigger_update_timestamp_sale_payments BEFORE UPDATE ON sale_payments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_automation_workflows ON automation_workflows;
CREATE TRIGGER trigger_update_timestamp_automation_workflows BEFORE UPDATE ON automation_workflows FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_workflow_triggers ON workflow_triggers;
CREATE TRIGGER trigger_update_timestamp_workflow_triggers BEFORE UPDATE ON workflow_triggers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_workflow_executions ON workflow_executions;
CREATE TRIGGER trigger_update_timestamp_workflow_executions BEFORE UPDATE ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trigger_update_timestamp_notifications ON notifications;
CREATE TRIGGER trigger_update_timestamp_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- PASO 6: ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Tiempo: 1 segundo
-- Habilita seguridad a nivel de fila

-- Habilitar RLS en todas las tablas operativas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- TABLA: users
DROP POLICY IF EXISTS "Users see only their company users" ON users;
CREATE POLICY "Users see only their company users"
ON users FOR SELECT
USING (company_id = current_user_company_id());

DROP POLICY IF EXISTS "Admins create users" ON users;
CREATE POLICY "Admins create users"
ON users FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND current_user_has_role('admin'::role_name_type)
);

DROP POLICY IF EXISTS "Users update own profile or admins update" ON users;
CREATE POLICY "Users update own profile or admins update"
ON users FOR UPDATE
USING (
  id = current_user_id()
  OR (
    company_id = current_user_company_id()
    AND current_user_has_role('admin'::role_name_type)
  )
);

-- TABLA: clients
DROP POLICY IF EXISTS "Users see clients from their company only" ON clients;
CREATE POLICY "Users see clients from their company only"
ON clients FOR SELECT
USING (company_id = current_user_company_id());

DROP POLICY IF EXISTS "Employees and admins create clients" ON clients;
CREATE POLICY "Employees and admins create clients"
ON clients FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee'::role_name_type)
    OR current_user_has_role('admin'::role_name_type)
  )
);

DROP POLICY IF EXISTS "Employees and admins update clients" ON clients;
CREATE POLICY "Employees and admins update clients"
ON clients FOR UPDATE
USING (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee'::role_name_type)
    OR current_user_has_role('admin'::role_name_type)
  )
);

-- TABLA: sales
DROP POLICY IF EXISTS "Users see sales from their company only" ON sales;
CREATE POLICY "Users see sales from their company only"
ON sales FOR SELECT
USING (company_id = current_user_company_id());

DROP POLICY IF EXISTS "Employees and admins create sales" ON sales;
CREATE POLICY "Employees and admins create sales"
ON sales FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee'::role_name_type)
    OR current_user_has_role('admin'::role_name_type)
  )
);

DROP POLICY IF EXISTS "Employees update their own sales, admins update all" ON sales;
CREATE POLICY "Employees update their own sales, admins update all"
ON sales FOR UPDATE
USING (
  company_id = current_user_company_id()
  AND (
    (
      user_id = current_user_id()
      AND NOT is_cancelled
    )
    OR current_user_has_role('admin'::role_name_type)
  )
);

-- TABLA: audit_logs
DROP POLICY IF EXISTS "Only admins see audit logs" ON audit_logs;
CREATE POLICY "Only admins see audit logs"
ON audit_logs FOR SELECT
USING (
  company_id = current_user_company_id()
  AND current_user_has_role('admin'::role_name_type)
);

DROP POLICY IF EXISTS "Audit logs are read-only" ON audit_logs;
CREATE POLICY "Audit logs are read-only"
ON audit_logs FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "Audit logs cannot be deleted" ON audit_logs;
CREATE POLICY "Audit logs cannot be deleted"
ON audit_logs FOR DELETE
USING (false);

-- TABLA: vehicles
DROP POLICY IF EXISTS "Users see vehicles from their company" ON vehicles;
CREATE POLICY "Users see vehicles from their company"
ON vehicles FOR SELECT
USING (company_id = current_user_company_id());

DROP POLICY IF EXISTS "Employees and admins create vehicles" ON vehicles;
CREATE POLICY "Employees and admins create vehicles"
ON vehicles FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND (
    current_user_has_role('employee'::role_name_type)
    OR current_user_has_role('admin'::role_name_type)
  )
);

-- TABLA: sale_details
DROP POLICY IF EXISTS "Users see sale_details from their company" ON sale_details;
CREATE POLICY "Users see sale_details from their company"
ON sale_details FOR SELECT
USING (
  sale_id IN (
    SELECT id FROM sales WHERE company_id = current_user_company_id()
  )
);

-- TABLA: notifications
DROP POLICY IF EXISTS "Users see notifications from their company" ON notifications;
CREATE POLICY "Users see notifications from their company"
ON notifications FOR SELECT
USING (company_id = current_user_company_id());

-- TABLA: automation_workflows
DROP POLICY IF EXISTS "Users see workflows from their company" ON automation_workflows;
CREATE POLICY "Users see workflows from their company"
ON automation_workflows FOR SELECT
USING (company_id = current_user_company_id());

DROP POLICY IF EXISTS "Admins manage workflows" ON automation_workflows;
CREATE POLICY "Admins manage workflows"
ON automation_workflows FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND current_user_has_role('admin'::role_name_type)
);

-- ============================================================================
-- PASO 7: VISTAS PARA REPORTING (OPCIONAL)
-- ============================================================================
-- Tiempo: 1 segundo
-- Útiles para dashboards y análisis

-- Vista: Clientes inactivos (60+ días sin compras)
CREATE OR REPLACE VIEW v_inactive_clients AS
SELECT 
  c.id,
  c.company_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.last_purchase_date,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - c.last_purchase_date) AS days_inactive,
  cs.name AS client_status,
  c.total_purchases
FROM clients c
JOIN client_status cs ON c.client_status_id = cs.id
WHERE c.deleted_at IS NULL
AND (
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - c.last_purchase_date) >= 60
  OR c.last_purchase_date IS NULL
);

-- Vista: Resumen de ventas por período
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
  s.company_id,
  DATE(s.sale_date) AS sale_date,
  COUNT(*) AS total_transactions,
  SUM(s.subtotal) AS total_subtotal,
  SUM(s.tax_amount) AS total_taxes,
  SUM(s.total_amount) AS total_revenue,
  COUNT(DISTINCT s.client_id) AS unique_clients,
  AVG(s.total_amount) AS avg_transaction_value
FROM sales s
WHERE s.deleted_at IS NULL
AND s.is_cancelled = false
GROUP BY s.company_id, DATE(s.sale_date);

-- Vista: Servicios más vendidos
CREATE OR REPLACE VIEW v_top_services AS
SELECT 
  s.company_id,
  svc.id,
  svc.name,
  svc.service_category_id,
  sc.name AS category,
  COUNT(sd.id) AS times_sold,
  SUM(sd.quantity) AS total_quantity,
  SUM(sd.subtotal) AS total_revenue,
  AVG(sd.unit_price) AS avg_price
FROM sale_details sd
JOIN sales s ON sd.sale_id = s.id
JOIN services svc ON sd.service_id = svc.id
JOIN service_categories sc ON svc.service_category_id = sc.id
WHERE s.deleted_at IS NULL
AND s.is_cancelled = false
GROUP BY s.company_id, svc.id, svc.name, svc.service_category_id, sc.name;

-- Vista: KPIs por empresa
CREATE OR REPLACE VIEW v_company_kpis AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  COUNT(DISTINCT cl.id) AS total_clients,
  COUNT(DISTINCT CASE WHEN cl.deleted_at IS NULL THEN cl.id END) AS active_clients,
  COUNT(DISTINCT s.id) AS total_transactions,
  SUM(s.total_amount) AS total_revenue,
  AVG(s.total_amount) AS avg_transaction_value,
  MAX(s.sale_date) AS last_transaction_date,
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_clients_30d
FROM companies c
LEFT JOIN clients cl ON c.id = cl.company_id
LEFT JOIN sales s ON c.id = s.company_id AND s.deleted_at IS NULL AND s.is_cancelled = false
GROUP BY c.id, c.name;

-- ============================================================================
-- FIN ESTRUCTURA SQL
-- ============================================================================

-- ✅ VERIFICACIÓN FINAL (ejecuta esto al terminar TODOS los pasos)

-- 1. Verificar 18 tablas creadas:
-- SELECT COUNT(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'public';
-- ESPERADO: 18

-- 2. Verificar RLS habilitado:
-- SELECT COUNT(*) as rls_habilitado FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
-- ESPERADO: 16

-- 3. Verificar índices creados:
-- SELECT COUNT(*) as total_indices FROM pg_indexes WHERE schemaname = 'public' AND tablename != 'pg_toast_temp_*';
-- ESPERADO: 60+

-- 4. Verificar vistas creadas:
-- SELECT COUNT(*) as total_vistas FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW';
-- ESPERADO: 4

-- 5. Verificar triggers creados:
-- SELECT COUNT(*) as total_triggers FROM information_schema.triggers WHERE trigger_schema = 'public';
-- ESPERADO: 25+

-- ============================================================================
-- 🎯 SIGUIENTE: DESDE AQUÍ EMPIEZAS A USAR LA PÁGINA
-- ============================================================================

-- A partir de ahora:
-- 1. La base de datos está LISTA para recibir datos
-- 2. Abre tu app Next.js
-- 3. Crea la primera empresa desde el formulario de registro
-- 4. Crea usuarios, clientes, vehículos, servicios, etc. desde la página
-- 5. La auditoría se registrará automáticamente
-- 6. Los timestamps se actualizarán automáticamente
-- 7. El RLS protegerá los datos por empresa
-- 
-- ¡Base de datos profesional lista para producción! 🚀
