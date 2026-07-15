# Fixtures de Datos Demo - BIA Platform
# Descripción: Crea datos de prueba realistas para desarrollar y probar la aplicación
# Ejecución: Copiar en Supabase SQL Editor DESPUÉS de ejecutar SQL_SCRIPT_INICIAL_SUPABASE.sql

## PASO 1: Obtener IDs de las empresas y usuarios

-- Primero obtén el UUID de la empresa demo
SELECT id FROM companies WHERE name = 'Lavadero Demo' LIMIT 1;
-- Copia el UUID, lo necesitarás en los siguientes pasos

-- ============================================================================
-- PASO 2: CREAR USUARIOS DEMO
-- ============================================================================

-- Importante: Los usuarios en Supabase deben crearse via Auth Console,
-- pero aquí creamos registros en la tabla "users" para que funcione RLS.

-- Para simplificar, vamos a hacer INSERT directamente
-- En producción, esto se hace via Supabase Auth UI

INSERT INTO users (
  id,
  company_id,
  email,
  full_name,
  phone,
  auth_provider,
  is_active
) VALUES 
-- REEMPLAZA: 'COMPANY_UUID_AQUI' con el UUID de Lavadero Demo
-- Usuario Admin
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'admin@lavadero.demo', 'Juan Administrador', '+1234567890', 'supabase', true),
-- Usuario Employee
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'empleado@lavadero.demo', 'María Empleada', '+0987654321', 'supabase', true),
-- Usuario Manager
(gen_random_uuid(), 'COMPANY_UUID_AQUI', 'gerente@lavadero.demo', 'Carlos Gerente', '+5555555555', 'supabase', true);

-- Verifica que se crearon
SELECT id, email, full_name FROM users WHERE company_id = 'COMPANY_UUID_AQUI';

-- ============================================================================
-- PASO 3: ASIGNAR ROLES A USUARIOS
-- ============================================================================

-- REEMPLAZA: 'COMPANY_UUID_AQUI' y 'USER_ID_*' con los UUIDs reales

-- Insertar roles (si no existen)
INSERT INTO roles (company_id, name, description, is_system_role, permissions) VALUES
('COMPANY_UUID_AQUI', 'admin', 'Administrador del sistema', true, '["*"]'),
('COMPANY_UUID_AQUI', 'employee', 'Empleado operativo', true, '["clients:read", "clients:create", "sales:read", "sales:create"]'),
('COMPANY_UUID_AQUI', 'manager', 'Gerente/Supervisor', true, '["clients:*", "sales:*", "reports:read"]')
ON CONFLICT (company_id, name) DO NOTHING;

-- Obtener roles
SELECT id, name FROM roles WHERE company_id = 'COMPANY_UUID_AQUI';

-- Asignar roles a usuarios (REEMPLAZA UUIDs)
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
('ADMIN_USER_ID', 'ADMIN_ROLE_ID', 'ADMIN_USER_ID'),
('EMPLOYEE_USER_ID', 'EMPLOYEE_ROLE_ID', 'ADMIN_USER_ID'),
('MANAGER_USER_ID', 'MANAGER_ROLE_ID', 'ADMIN_USER_ID')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- PASO 4: CREAR CATEGORÍAS DE SERVICIOS
-- ============================================================================

INSERT INTO service_categories (company_id, name, description, icon_code, display_order, is_active) VALUES
('COMPANY_UUID_AQUI', 'Lavado Básico', 'Servicios de lavado estándar', 'Droplet', 1, true),
('COMPANY_UUID_AQUI', 'Detallado', 'Servicios premium de detallado', 'Sparkles', 2, true),
('COMPANY_UUID_AQUI', 'Mantenimiento', 'Servicios de mantenimiento preventivo', 'Wrench', 3, true),
('COMPANY_UUID_AQUI', 'Protección', 'Servicios de protección y sellado', 'Shield', 4, true)
ON CONFLICT DO NOTHING;

-- Obtener IDs de categorías
SELECT id, name FROM service_categories WHERE company_id = 'COMPANY_UUID_AQUI';

-- ============================================================================
-- PASO 5: CREAR SERVICIOS
-- ============================================================================

-- REEMPLAZA: 'COMPANY_UUID_AQUI', 'CATEGORY_ID_*', 'ADMIN_USER_ID'

INSERT INTO services (
  company_id,
  service_category_id,
  name,
  description,
  base_price,
  duration_minutes,
  is_taxable,
  tax_rate,
  is_active,
  requires_vehicle,
  created_by
) VALUES
-- Lavado Básico
('COMPANY_UUID_AQUI', 'LAVADO_BASICO_CATEGORY_ID', 'Lavado Exterior', 'Lavado completo del exterior del vehículo', 25.00, 30, true, 16.00, true, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'LAVADO_BASICO_CATEGORY_ID', 'Lavado Interior', 'Aspirado y limpieza del interior', 35.00, 45, true, 16.00, true, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'LAVADO_BASICO_CATEGORY_ID', 'Lavado Completo', 'Lavado exterior + interior + motor', 50.00, 90, true, 16.00, true, true, 'ADMIN_USER_ID'),

-- Detallado
('COMPANY_UUID_AQUI', 'DETALLADO_CATEGORY_ID', 'Detallado Exterior', 'Pulido y enceramiento de pintura', 75.00, 120, true, 16.00, true, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'DETALLADO_CATEGORY_ID', 'Detallado Interior Premium', 'Limpieza profunda y acondicionamiento', 100.00, 180, true, 16.00, true, true, 'ADMIN_USER_ID'),

-- Mantenimiento
('COMPANY_UUID_AQUI', 'MANTENIMIENTO_CATEGORY_ID', 'Cambio de Aceite', 'Cambio de aceite y filtro', 45.00, 30, true, 16.00, true, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'MANTENIMIENTO_CATEGORY_ID', 'Filtro de Aire', 'Reemplazo de filtro de aire', 30.00, 15, true, 16.00, true, true, 'ADMIN_USER_ID'),

-- Protección
('COMPANY_UUID_AQUI', 'PROTECCION_CATEGORY_ID', 'Sellado de Pintura', 'Sellado profesional de pintura', 120.00, 240, true, 16.00, true, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'PROTECCION_CATEGORY_ID', 'Tratamiento de Cuero', 'Acondicionamiento y protección de cuero', 85.00, 90, true, 16.00, true, true, 'ADMIN_USER_ID')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 6: CREAR CLIENTES DEMO
-- ============================================================================

-- REEMPLAZA: 'COMPANY_UUID_AQUI', 'ADMIN_USER_ID', obtén 'STATUS_NUEVO_ID' de:
-- SELECT id FROM client_status WHERE name = 'Nuevo' LIMIT 1;

INSERT INTO clients (
  company_id,
  first_name,
  last_name,
  email,
  phone,
  phone_alt,
  date_of_birth,
  gender,
  document_type,
  document_number,
  address,
  city,
  state_province,
  postal_code,
  country,
  client_status_id,
  total_purchases,
  lifetime_value,
  last_purchase_date,
  preferred_contact,
  is_premium,
  created_by
) VALUES
('COMPANY_UUID_AQUI', 'Carlos', 'Mendoza', 'carlos.mendoza@email.com', '+5218331234567', '+5218339876543', '1985-03-15', 'M', 'DNI', '12345678', 'Calle Principal 123', 'Monterrey', 'Nuevo León', '64000', 'Mexico', 'STATUS_NUEVO_ID', 250.00, 1250.00, NOW() - INTERVAL '7 days', 'whatsapp', false, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'María', 'González', 'maria.gonzalez@email.com', '+5218332234567', NULL, '1990-07-22', 'F', 'DNI', '87654321', 'Av. Secundaria 456', 'Guadalajara', 'Jalisco', '44000', 'Mexico', 'STATUS_NUEVO_ID', 500.00, 2500.00, NOW() - INTERVAL '3 days', 'phone', true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'Roberto', 'López', 'rlopez@email.com', '+5218333234567', '+5218334567890', '1988-11-30', 'M', 'RUT', '12.345.678-9', 'Blvd. Norte 789', 'Monterrey', 'Nuevo León', '64100', 'Mexico', 'STATUS_NUEVO_ID', 750.00, 3750.00, NOW() - INTERVAL '14 days', 'email', false, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'Alejandra', 'Martínez', 'alejandra.m@email.com', '+5218335234567', NULL, '1992-05-10', 'F', 'DNI', '11223344', 'Calle Oriente 321', 'Mexico City', 'CDMX', '06000', 'Mexico', 'STATUS_NUEVO_ID', 1200.00, 6000.00, NOW() - INTERVAL '2 days', 'whatsapp', true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'Diego', 'Ramírez', 'diego.ramirez@email.com', '+5218336234567', '+5218337123456', '1980-01-25', 'M', 'PASAPORTE', 'A12345678', 'Paseo Sur 654', 'Monterrey', 'Nuevo León', '64500', 'Mexico', 'STATUS_NUEVO_ID', 100.00, 500.00, NOW() - INTERVAL '45 days', 'phone', false, 'ADMIN_USER_ID')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 7: CREAR VEHÍCULOS PARA CLIENTES
-- ============================================================================

-- Obtener IDs de clientes:
-- SELECT id, first_name FROM clients WHERE company_id = 'COMPANY_UUID_AQUI' ORDER BY created_at DESC LIMIT 5;

-- REEMPLAZA: 'COMPANY_UUID_AQUI', 'ADMIN_USER_ID', 'CLIENT_ID_*'

INSERT INTO vehicles (
  company_id,
  client_id,
  license_plate,
  vin,
  make,
  model,
  year,
  color,
  vehicle_type,
  fuel_type,
  registration_date,
  next_service_date,
  mileage_km,
  service_history_count,
  is_active,
  created_by
) VALUES
('COMPANY_UUID_AQUI', 'CLIENT_ID_CARLOS', 'MNT-1234', 'WVWZZZ3CZ9E123456', 'Volkswagen', 'Golf', 2020, 'Negro', 'sedan', 'gasolina', '2020-05-15', NOW() + INTERVAL '30 days', 45000, 3, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_CARLOS', 'MNT-5678', 'JTDKRFB32E1234567', 'Toyota', 'Corolla', 2018, 'Plata', 'sedan', 'gasolina', '2018-08-20', NOW() + INTERVAL '45 days', 78000, 5, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_MARIA', 'GDL-9012', 'KNDJP3AJ3J7123456', 'Hyundai', 'Santa Fe', 2021, 'Blanco', 'suv', 'gasolina', '2021-02-10', NOW() + INTERVAL '20 days', 32000, 2, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_ROBERTO', 'MNT-3456', 'WBAUC1G57GL123456', 'BMW', 'X5', 2019, 'Gris', 'suv', 'diesel', '2019-11-05', NOW() + INTERVAL '60 days', 65000, 4, true, 'ADMIN_USER_ID'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_ALEJANDRA', 'CDMX-7890', 'JTHBP5C25G5123456', 'Honda', 'Accord', 2016, 'Azul', 'sedan', 'gasolina', '2016-04-12', NOW() + INTERVAL '15 days', 125000, 8, true, 'ADMIN_USER_ID')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 8: CREAR VENTAS DE PRUEBA
-- ============================================================================

-- Primero obtén los IDs necesarios:
-- SELECT id, name FROM services WHERE company_id = 'COMPANY_UUID_AQUI' LIMIT 3;
-- SELECT id, first_name FROM clients WHERE company_id = 'COMPANY_UUID_AQUI' LIMIT 3;
-- SELECT id, license_plate FROM vehicles WHERE company_id = 'COMPANY_UUID_AQUI' LIMIT 3;

-- REEMPLAZA: todos los UUIDs

INSERT INTO sales (
  company_id,
  client_id,
  vehicle_id,
  user_id,
  sale_number,
  sale_date,
  subtotal,
  tax_amount,
  total_amount,
  discount_amount,
  payment_method,
  payment_status,
  notes
) VALUES
('COMPANY_UUID_AQUI', 'CLIENT_ID_CARLOS', 'VEHICLE_ID_1', 'ADMIN_USER_ID', 'SAL-2026-0001', NOW() - INTERVAL '7 days', 100.00, 16.00, 116.00, 0.00, 'card', 'paid', 'Lavado completo realizado'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_MARIA', 'VEHICLE_ID_3', 'ADMIN_USER_ID', 'SAL-2026-0002', NOW() - INTERVAL '3 days', 175.00, 28.00, 203.00, 10.00, 'cash', 'paid', 'Detallado exterior, descuento cliente premium'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_ROBERTO', 'VEHICLE_ID_4', 'ADMIN_USER_ID', 'SAL-2026-0003', NOW() - INTERVAL '1 day', 75.00, 12.00, 87.00, 0.00, 'transfer', 'paid', 'Cambio de aceite'),
('COMPANY_UUID_AQUI', 'CLIENT_ID_ALEJANDRA', 'VEHICLE_ID_5', 'ADMIN_USER_ID', 'SAL-2026-0004', NOW(), 120.00, 19.20, 139.20, 0.00, 'card', 'pending', 'Sellado de pintura pendiente de pago')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 9: CREAR DETALLES DE VENTAS (ITEMS)
-- ============================================================================

-- Obtén los IDs de las ventas:
-- SELECT id, sale_number FROM sales WHERE company_id = 'COMPANY_UUID_AQUI';

-- Y los IDs de servicios:
-- SELECT id, name, base_price FROM services WHERE company_id = 'COMPANY_UUID_AQUI' LIMIT 5;

-- REEMPLAZA: todos los UUIDs

INSERT INTO sale_details (
  sale_id,
  service_id,
  quantity,
  unit_price,
  tax_amount,
  subtotal
) VALUES
-- Venta 1 (Lavado completo)
('SALE_ID_1', 'SERVICE_LAVADO_COMPLETO', 1, 50.00, 8.00, 50.00),

-- Venta 2 (Detallado exterior)
('SALE_ID_2', 'SERVICE_DETALLADO_EXTERIOR', 1, 75.00, 12.00, 75.00),
('SALE_ID_2', 'SERVICE_LAVADO_INTERIOR', 1, 35.00, 5.60, 35.00),

-- Venta 3 (Cambio de aceite)
('SALE_ID_3', 'SERVICE_CAMBIO_ACEITE', 1, 45.00, 7.20, 45.00),

-- Venta 4 (Sellado de pintura)
('SALE_ID_4', 'SERVICE_SELLADO_PINTURA', 1, 120.00, 19.20, 120.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 10: CREAR PAGOS
-- ============================================================================

-- REEMPLAZA: todos los UUIDs, 'ADMIN_USER_ID' y 'COMPANY_UUID_AQUI'

INSERT INTO sale_payments (
  sale_id,
  company_id,
  payment_method,
  amount,
  payment_date,
  processed_by
) VALUES
('SALE_ID_1', 'COMPANY_UUID_AQUI', 'card', 116.00, NOW() - INTERVAL '7 days', 'ADMIN_USER_ID'),
('SALE_ID_2', 'COMPANY_UUID_AQUI', 'cash', 203.00, NOW() - INTERVAL '3 days', 'ADMIN_USER_ID'),
('SALE_ID_3', 'COMPANY_UUID_AQUI', 'transfer', 87.00, NOW() - INTERVAL '1 day', 'ADMIN_USER_ID')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 11: VERIFICAR DATOS CREADOS
-- ============================================================================

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM users WHERE company_id = 'COMPANY_UUID_AQUI') AS total_usuarios,
  (SELECT COUNT(*) FROM clients WHERE company_id = 'COMPANY_UUID_AQUI') AS total_clientes,
  (SELECT COUNT(*) FROM vehicles WHERE company_id = 'COMPANY_UUID_AQUI') AS total_vehiculos,
  (SELECT COUNT(*) FROM services WHERE company_id = 'COMPANY_UUID_AQUI') AS total_servicios,
  (SELECT COUNT(*) FROM sales WHERE company_id = 'COMPANY_UUID_AQUI') AS total_ventas;

-- Ver últimos clientes
SELECT id, first_name, last_name, email, phone, total_purchases 
FROM clients 
WHERE company_id = 'COMPANY_UUID_AQUI' 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver últimas ventas
SELECT id, sale_number, total_amount, payment_status, sale_date 
FROM sales 
WHERE company_id = 'COMPANY_UUID_AQUI' 
ORDER BY sale_date DESC 
LIMIT 5;

-- ============================================================================
-- FIN DE FIXTURES
-- ============================================================================

-- ✅ SI LLEGASTE AQUÍ SIN ERRORES, TODOS LOS DATOS DEMO ESTÁN CREADOS

-- Próximos pasos:
-- 1. Ahora configura el Next.js para traer estos datos
-- 2. Crea los servicios de negocio (ClientService, SalesService, etc.)
-- 3. Crea las APIs (GET /api/clients, POST /api/sales, etc.)
-- 4. Prueba las vistas desde el frontend
