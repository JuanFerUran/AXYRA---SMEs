-- ============================================================================
-- SEED DATA PARA SUPABASE / BIA PLATFORM
-- ============================================================================
-- Este script inserta datos de ejemplo mínimos para validar esquema,
-- relaciones, RLS y vistas.
-- Ejecutar después de haber creado todas las tablas y políticas.
-- ============================================================================

-- Empresa de prueba
INSERT INTO companies (name, description, subscription_tier)
VALUES (
  'Lavadero Demo',
  'Empresa de demostración para pruebas del sistema',
  'pro'
) ON CONFLICT (name) DO NOTHING;

-- Obtener company_id de la empresa demo
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
)
INSERT INTO roles (company_id, name, description, permissions, is_system_role)
SELECT
  company_id,
  role_name,
  role_description,
  permissions,
  true
FROM company,
  (VALUES
    ('admin'::role_name_type, 'Administrador del sistema', '["clients:create","clients:update","sales:create","sales:update","users:create","users:update","roles:create","roles:update"]'::jsonb),
    ('employee'::role_name_type, 'Empleado operativo', '["clients:create","clients:update","sales:create","sales:update"]'::jsonb)
  ) AS r(role_name, role_description, permissions)
ON CONFLICT ON CONSTRAINT roles_company_id_name_key DO NOTHING;

-- Usuarios de prueba
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
role_admin AS (
  SELECT id AS role_id FROM roles WHERE company_id = (SELECT company_id FROM company) AND name = 'admin'
),
role_employee AS (
  SELECT id AS role_id FROM roles WHERE company_id = (SELECT company_id FROM company) AND name = 'employee'
)
INSERT INTO users (company_id, email, full_name, phone, auth_provider, is_active)
VALUES
  ((SELECT company_id FROM company), 'admin@lavadero.demo', 'Admin Demo', '+56911111111', 'supabase', true),
  ((SELECT company_id FROM company), 'empleado@lavadero.demo', 'Empleado Demo', '+56922222222', 'supabase', true)
ON CONFLICT (email) DO NOTHING;

-- Asignar roles a usuarios
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
admin_user AS (
  SELECT id AS user_id FROM users WHERE email = 'admin@lavadero.demo'
),
employee_user AS (
  SELECT id AS user_id FROM users WHERE email = 'empleado@lavadero.demo'
),
role_admin AS (
  SELECT id AS role_id FROM roles WHERE company_id = (SELECT company_id FROM company) AND name = 'admin'
),
role_employee AS (
  SELECT id AS role_id FROM roles WHERE company_id = (SELECT company_id FROM company) AND name = 'employee'
)
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT user_id, role_id, (SELECT user_id FROM admin_user)
FROM admin_user, role_admin
ON CONFLICT (user_id, role_id) DO NOTHING;

WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
admin_user AS (
  SELECT id AS user_id FROM users WHERE email = 'admin@lavadero.demo'
),
employee_user AS (
  SELECT id AS user_id FROM users WHERE email = 'empleado@lavadero.demo'
),
role_employee AS (
  SELECT id AS role_id FROM roles WHERE company_id = (SELECT company_id FROM company) AND name = 'employee'
)
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT user_id, role_id, (SELECT user_id FROM admin_user)
FROM employee_user, role_employee
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Clientes de prueba
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
status AS (
  SELECT id AS client_status_id FROM client_status WHERE name = 'Activo'
),
creator AS (
  SELECT id AS user_id FROM users WHERE email = 'admin@lavadero.demo'
)
INSERT INTO clients (
  company_id, first_name, last_name, email, phone, client_status_id, total_purchases, lifetime_value, last_purchase_date, preferred_contact, is_premium, created_by
)
VALUES
  ((SELECT company_id FROM company), 'María', 'Pérez', 'maria.perez@example.com', '+56933333333', (SELECT client_status_id FROM status), 150000.00, 150000.00, NOW() - INTERVAL '10 days', 'whatsapp', true, (SELECT user_id FROM creator)),
  ((SELECT company_id FROM company), 'Jorge', 'González', 'jorge.gonzalez@example.com', '+56944444444', (SELECT client_status_id FROM status), 54000.00, 54000.00, NOW() - INTERVAL '75 days', 'email', false, (SELECT user_id FROM creator))
ON CONFLICT DO NOTHING;

-- Categorías y servicios de ejemplo
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
)
INSERT INTO service_categories (company_id, name, description, display_order)
SELECT company_id, data.name, data.description, data.ord
FROM company,
  (VALUES
    ('Lavado Básico', 'Lavado exterior e interior ligero', 10),
    ('Lavado Completo', 'Lavado completo y encerado', 20),
    ('Detailing', 'Detalle premium con pulido y tratamiento cerámico', 30)
  ) AS data(name, description, ord)
ON CONFLICT (company_id, name) DO NOTHING;

WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
category AS (
  SELECT id AS category_id FROM service_categories WHERE name = 'Lavado Completo' AND company_id = (SELECT company_id FROM company)
),
service_data AS (
  SELECT * FROM (VALUES
    ('Lavado completo con aspirado', 'Lavado completo exterior e interior', 15000.00, 40, true),
    ('Lavado express', 'Lavado detallado rápido', 9000.00, 25, false)
  ) AS t(service_name, service_description, service_price, service_duration, service_requires_vehicle)
)
INSERT INTO services (company_id, service_category_id, name, description, base_price, duration_minutes, requires_vehicle, created_by)
SELECT
  company.company_id,
  category.category_id,
  service_data.service_name,
  service_data.service_description,
  service_data.service_price,
  service_data.service_duration,
  service_data.service_requires_vehicle,
  (SELECT id FROM users WHERE email = 'admin@lavadero.demo')
FROM company
CROSS JOIN category
CROSS JOIN service_data
ON CONFLICT DO NOTHING;

-- Ventas de ejemplo
WITH company AS (
  SELECT id AS company_id FROM companies WHERE name = 'Lavadero Demo'
),
client AS (
  SELECT id AS client_id FROM clients WHERE email = 'maria.perez@example.com'
),
service AS (
  SELECT id AS service_id FROM services WHERE name = 'Lavado completo con aspirado' AND company_id = (SELECT company_id FROM company)
),
creator AS (
  SELECT id AS user_id FROM users WHERE email = 'empleado@lavadero.demo'
)
INSERT INTO sales (
  company_id, client_id, user_id, sale_number, subtotal, tax_amount, total_amount, payment_method, payment_status, notes, created_by
)
VALUES (
  (SELECT company_id FROM company),
  (SELECT client_id FROM client),
  (SELECT user_id FROM creator),
  'SAL-0001',
  15000.00,
  2850.00,
  17850.00,
  'card',
  'paid',
  'Lavado completo con aspirado',
  (SELECT user_id FROM creator)
)
ON CONFLICT DO NOTHING;

WITH sale AS (
  SELECT id AS sale_id FROM sales WHERE sale_number = 'SAL-0001' AND company_id = (SELECT id FROM companies WHERE name = 'Lavadero Demo')
),
service AS (
  SELECT id AS service_id FROM services WHERE name = 'Lavado completo con aspirado' AND company_id = (SELECT id FROM companies WHERE name = 'Lavadero Demo')
)
INSERT INTO sale_details (sale_id, service_id, quantity, unit_price, subtotal)
SELECT
  (SELECT sale_id FROM sale),
  (SELECT service_id FROM service),
  1,
  15000.00,
  15000.00
ON CONFLICT DO NOTHING;

-- Consultas de validación
-- 1) Conteo general
SELECT
  (SELECT COUNT(*) FROM companies) AS companies_count,
  (SELECT COUNT(*) FROM users) AS users_count,
  (SELECT COUNT(*) FROM clients) AS clients_count,
  (SELECT COUNT(*) FROM sales) AS sales_count;

-- 2) Verificar vistas
SELECT * FROM v_company_kpis LIMIT 5;
SELECT * FROM v_inactive_clients LIMIT 5;
SELECT * FROM v_sales_summary LIMIT 5;
