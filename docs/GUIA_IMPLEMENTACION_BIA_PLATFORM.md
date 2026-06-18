# Guías de Implementación y Uso - BIA Platform

## Tabla de Contenidos
1. [Queries SQL Útiles](#queries-sql-útiles)
2. [Ejemplos de Implementación en Next.js](#ejemplos-de-implementación-en-nextjs)
3. [Configuración de n8n](#configuración-de-n8n)
4. [Ejemplos de RLS](#ejemplos-de-rls)
5. [Troubleshooting](#troubleshooting)

---

## Queries SQL Útiles

### 1. Obtener todos los clientes de una empresa con su estado

```sql
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  cs.name AS status,
  c.total_purchases,
  c.lifetime_value,
  c.last_purchase_date,
  COUNT(v.id) AS total_vehicles,
  COUNT(s.id) AS total_purchases_count
FROM clients c
JOIN client_status cs ON c.client_status_id = cs.id
LEFT JOIN vehicles v ON c.id = v.client_id AND v.deleted_at IS NULL
LEFT JOIN sales s ON c.id = s.client_id AND s.deleted_at IS NULL AND s.is_cancelled = false
WHERE c.company_id = 'company-uuid'
AND c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, cs.name, c.total_purchases, c.lifetime_value, c.last_purchase_date
ORDER BY c.created_at DESC;
```

### 2. Detectar clientes inactivos (60+ días) para recuperación

```sql
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.preferred_contact,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - c.last_purchase_date) AS days_inactive,
  c.total_purchases
FROM clients c
WHERE c.company_id = 'company-uuid'
AND c.deleted_at IS NULL
AND c.last_purchase_date IS NOT NULL
AND EXTRACT(DAY FROM CURRENT_TIMESTAMP - c.last_purchase_date) >= 60
ORDER BY days_inactive DESC;
```

### 3. Clientes con cumpleaños en los próximos 7 días

```sql
SELECT 
  id,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  TO_CHAR(date_of_birth, 'DD-MM') AS birthday_formatted,
  total_purchases
FROM clients
WHERE company_id = 'company-uuid'
AND deleted_at IS NULL
AND date_of_birth IS NOT NULL
AND TO_CHAR(date_of_birth, 'MM-DD') 
    BETWEEN 
      TO_CHAR(CURRENT_DATE, 'MM-DD')
      AND 
      TO_CHAR(CURRENT_DATE + INTERVAL '7 days', 'MM-DD')
ORDER BY TO_CHAR(date_of_birth, 'MM-DD') ASC;
```

### 4. Resumen de ventas por día

```sql
SELECT 
  DATE(sale_date) AS date,
  COUNT(*) AS transactions,
  COUNT(DISTINCT client_id) AS unique_clients,
  SUM(subtotal) AS subtotal,
  SUM(tax_amount) AS taxes,
  SUM(total_amount) AS total_revenue,
  AVG(total_amount) AS avg_transaction,
  COUNT(*) FILTER (WHERE is_cancelled) AS cancelled_transactions
FROM sales
WHERE company_id = 'company-uuid'
AND deleted_at IS NULL
AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(sale_date)
ORDER BY DATE(sale_date) DESC;
```

### 5. Servicios más vendidos (Top 10)

```sql
SELECT 
  svc.name,
  sc.name AS category,
  COUNT(sd.id) AS times_sold,
  SUM(sd.quantity) AS total_qty,
  SUM(sd.subtotal) AS total_revenue,
  ROUND(AVG(sd.unit_price)::NUMERIC, 2) AS avg_price,
  ROUND((SUM(sd.subtotal) / (SELECT SUM(total_amount) FROM sales WHERE company_id = 'company-uuid' AND deleted_at IS NULL AND is_cancelled = false) * 100)::NUMERIC, 2) AS pct_revenue
FROM sale_details sd
JOIN sales s ON sd.sale_id = s.id
JOIN services svc ON sd.service_id = svc.id
JOIN service_categories sc ON svc.service_category_id = sc.id
WHERE s.company_id = 'company-uuid'
AND s.deleted_at IS NULL
AND s.is_cancelled = false
GROUP BY svc.id, svc.name, sc.name
ORDER BY times_sold DESC
LIMIT 10;
```

### 6. Clientes con mayor lifetime value (Top 20)

```sql
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  c.lifetime_value,
  c.total_purchases AS purchase_count,
  ROUND((c.lifetime_value / NULLIF(c.total_purchases, 0))::NUMERIC, 2) AS avg_transaction_value,
  c.last_purchase_date,
  COUNT(DISTINCT v.id) AS vehicles
FROM clients c
LEFT JOIN vehicles v ON c.id = v.client_id AND v.deleted_at IS NULL
WHERE c.company_id = 'company-uuid'
AND c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email, c.lifetime_value, c.total_purchases
ORDER BY c.lifetime_value DESC
LIMIT 20;
```

### 7. Pagos pendientes

```sql
SELECT 
  s.id,
  s.sale_number,
  c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
  c.phone,
  s.total_amount,
  SUM(COALESCE(sp.amount, 0)) AS paid_amount,
  s.total_amount - SUM(COALESCE(sp.amount, 0)) AS pending_amount,
  s.sale_date,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - s.sale_date) AS days_pending,
  s.notes
FROM sales s
JOIN clients c ON s.client_id = c.id
LEFT JOIN sale_payments sp ON s.id = sp.sale_id
WHERE s.company_id = 'company-uuid'
AND s.deleted_at IS NULL
AND s.is_cancelled = false
AND s.payment_status IN ('pending', 'partial')
GROUP BY s.id, s.sale_number, c.first_name, c.last_name, c.phone, s.total_amount, s.sale_date, s.notes
ORDER BY s.sale_date DESC;
```

### 8. Historial de transacciones de un cliente

```sql
SELECT 
  s.id,
  s.sale_number,
  s.sale_date,
  s.total_amount,
  s.payment_status,
  STRING_AGG(svc.name, ', ') AS services,
  COUNT(sd.id) AS service_count,
  v.make || ' ' || v.model || ' (' || v.license_plate || ')' AS vehicle
FROM sales s
JOIN sale_details sd ON s.id = sd.sale_id
JOIN services svc ON sd.service_id = svc.id
LEFT JOIN vehicles v ON s.vehicle_id = v.id
WHERE s.client_id = 'client-uuid'
AND s.deleted_at IS NULL
GROUP BY s.id, s.sale_number, s.sale_date, s.total_amount, s.payment_status, v.make, v.model, v.license_plate
ORDER BY s.sale_date DESC;
```

### 9. Auditoría: Cambios en un registro específico

```sql
SELECT 
  al.id,
  al.action,
  al.old_values,
  al.new_values,
  u.full_name AS changed_by,
  al.ip_address,
  al.changes_summary,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.entity_type = 'sales'
AND al.entity_id = 'sale-uuid'
AND al.company_id = 'company-uuid'
ORDER BY al.created_at DESC;
```

### 10. Estado de workflows/automatizaciones

```sql
SELECT 
  aw.id,
  aw.name,
  aw.workflow_type,
  aw.trigger_type,
  aw.is_active,
  COUNT(we.id) AS total_executions,
  COUNT(we.id) FILTER (WHERE we.status = 'success') AS successful,
  COUNT(we.id) FILTER (WHERE we.status = 'failed') AS failed,
  MAX(we.executed_at) AS last_execution,
  ROUND((COUNT(we.id) FILTER (WHERE we.status = 'success') * 100.0 / NULLIF(COUNT(we.id), 0))::NUMERIC, 2) AS success_rate
FROM automation_workflows aw
LEFT JOIN workflow_executions we ON aw.id = we.workflow_id
WHERE aw.company_id = 'company-uuid'
AND aw.deleted_at IS NULL
GROUP BY aw.id, aw.name, aw.workflow_type, aw.trigger_type, aw.is_active
ORDER BY last_execution DESC;
```

---

## Ejemplos de Implementación en Next.js

### 1. Server Action para Registrar Cliente

```typescript
// src/actions/clients.ts

'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const createClientSchema = z.object({
  first_name: z.string().min(1, 'Nombre requerido').max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Teléfono inválido'),
  phone_alt: z.string().optional(),
  date_of_birth: z.string().datetime().optional(),
  gender: z.enum(['M', 'F', 'O', 'N']).optional(),
  document_type: z.enum(['DNI', 'RUT', 'CÉDULA', 'PASAPORTE']).optional(),
  document_number: z.string().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  preferred_contact: z.enum(['email', 'whatsapp', 'phone']).optional(),
});

export async function createClientAction(
  formData: z.infer<typeof createClientSchema>
) {
  try {
    // Validar datos de entrada
    const validated = createClientSchema.parse(formData);

    // Obtener cliente autenticado
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(
      process.env.CURRENT_USER_ID || ''
    );

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener empresa del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      throw new Error('Usuario no tiene empresa asignada');
    }

    // Obtener estado por defecto
    const { data: defaultStatus } = await supabase
      .from('client_status')
      .select('id')
      .eq('is_default', true)
      .single();

    // Insertar cliente
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        company_id: userData.company_id,
        first_name: validated.first_name,
        last_name: validated.last_name || null,
        email: validated.email || null,
        phone: validated.phone,
        phone_alt: validated.phone_alt || null,
        date_of_birth: validated.date_of_birth || null,
        gender: validated.gender || null,
        document_type: validated.document_type || null,
        document_number: validated.document_number || null,
        address: validated.address || null,
        city: validated.city || null,
        state_province: validated.state_province || null,
        postal_code: validated.postal_code || null,
        country: validated.country || null,
        client_status_id: defaultStatus?.id,
        preferred_contact: validated.preferred_contact || 'phone',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw new Error(`Error al crear cliente: ${error.message}`);
    }

    // Revalidar la página
    revalidatePath('/dashboard/clients');

    return {
      success: true,
      message: 'Cliente creado exitosamente',
      data: client,
    };
  } catch (error) {
    console.error('Error in createClientAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
```

### 2. Server Action para Registrar Venta (TRANSACCIÓN ATÓMICA)

```typescript
// src/actions/sales.ts

'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const createSaleSchema = z.object({
  client_id: z.string().uuid('ID de cliente inválido'),
  vehicle_id: z.string().uuid('ID de vehículo inválido').optional(),
  items: z.array(
    z.object({
      service_id: z.string().uuid('ID de servicio inválido'),
      quantity: z.number().int().min(1),
    })
  ).min(1, 'Debe incluir al menos un servicio'),
  discount_amount: z.number().min(0).optional(),
  discount_type: z.enum(['percentage', 'fixed', 'loyalty']).optional(),
  payment_method: z.enum(['cash', 'card', 'transfer', 'check']),
});

export async function createSaleAction(
  formData: z.infer<typeof createSaleSchema>
) {
  try {
    const validated = createSaleSchema.parse(formData);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Verificar cliente existe
    const { data: client } = await supabase
      .from('clients')
      .select('id, company_id, total_purchases')
      .eq('id', validated.client_id)
      .single();

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener precios de servicios
    const { data: services } = await supabase
      .from('service_pricing')
      .select('service_id, price, discount_percentage')
      .in('service_id', validated.items.map(item => item.service_id))
      .eq('is_active', true)
      .lte('effective_from', new Date().toISOString())
      .or('effective_until.is.null,effective_until.gte.' + new Date().toISOString());

    // Calcular totales
    let subtotal = 0;
    let total_tax = 0;
    const sale_items = [];

    for (const item of validated.items) {
      const service = services?.find(s => s.service_id === item.service_id);
      const unit_price = service?.price || 0;
      const item_subtotal = unit_price * item.quantity;
      
      // Obtener tax_rate del servicio
      const { data: serviceData } = await supabase
        .from('services')
        .select('tax_rate, is_taxable')
        .eq('id', item.service_id)
        .single();

      const tax_amount = serviceData?.is_taxable
        ? item_subtotal * (serviceData?.tax_rate || 0) / 100
        : 0;

      sale_items.push({
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price,
        tax_amount,
        subtotal: item_subtotal,
      });

      subtotal += item_subtotal;
      total_tax += tax_amount;
    }

    const total_amount = subtotal + total_tax - (validated.discount_amount || 0);

    // TRANSACCIÓN: Crear venta + detalles de venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        company_id: client.company_id,
        client_id: validated.client_id,
        vehicle_id: validated.vehicle_id || null,
        user_id: process.env.CURRENT_USER_ID || '',
        sale_number: `SAL-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        subtotal,
        tax_amount: total_tax,
        total_amount,
        discount_amount: validated.discount_amount || 0,
        discount_type: validated.discount_type || null,
        payment_method: validated.payment_method,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (saleError) {
      throw new Error(`Error creando venta: ${saleError.message}`);
    }

    // Insertar detalles de venta
    const { error: detailsError } = await supabase
      .from('sale_details')
      .insert(
        sale_items.map(item => ({
          sale_id: sale.id,
          service_id: item.service_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_amount: item.tax_amount,
          subtotal: item.subtotal,
        }))
      );

    if (detailsError) {
      // Si falla insertar detalles, cancelar la venta (rollback simulado)
      await supabase
        .from('sales')
        .update({ is_cancelled: true, cancellation_reason: 'Error en detalles' })
        .eq('id', sale.id);

      throw new Error(`Error creando detalles: ${detailsError.message}`);
    }

    // Actualizar cliente (desnormalizado)
    await supabase
      .from('clients')
      .update({
        total_purchases: client.total_purchases + 1,
        last_purchase_date: new Date().toISOString(),
        lifetime_value: (client.total_purchases || 0) + total_amount,
      })
      .eq('id', validated.client_id);

    // Trigger n8n si es necesario
    if (client.total_purchases >= 5) {
      // Disparar workflow de promoción
      // Esto se haría via webhook a n8n
    }

    revalidatePath('/dashboard/sales');
    revalidatePath(`/dashboard/clients/${validated.client_id}`);

    return {
      success: true,
      message: 'Venta registrada exitosamente',
      data: {
        sale_id: sale.id,
        sale_number: sale.sale_number,
        total_amount,
      },
    };
  } catch (error) {
    console.error('Error in createSaleAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
```

### 3. Hook personalizado para obtener clientes

```typescript
// src/hooks/useClients.ts

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string;
  total_purchases: number;
  lifetime_value: number;
  last_purchase_date: string | null;
  client_status: {
    id: string;
    name: string;
    color_code: string;
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
          .from('clients')
          .select(
            `
            id,
            first_name,
            last_name,
            email,
            phone,
            total_purchases,
            lifetime_value,
            last_purchase_date,
            client_status:client_status_id (id, name, color_code)
            `
          )
          .eq('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return { clients, loading, error };
}
```

### 4. Componente de Dashboard con Datos en Tiempo Real

```typescript
// src/components/DashboardOverview.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface KPI {
  total_clients: number;
  active_clients: number;
  total_revenue: number;
  avg_transaction: number;
  new_clients_30d: number;
}

export function DashboardOverview() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // Usar vista materializada
      const { data, error } = await supabase
        .from('v_company_kpis')
        .select('*')
        .single();

      if (!error) {
        setKpis(data as KPI);
      }
      setLoading(false);
    }

    fetchKPIs();

    // Subscribe a cambios en tiempo real
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const subscription = supabase
      .channel('kpi-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
        },
        () => {
          // Refrescar KPIs cuando hay cambios
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Clientes Totales" value={kpis?.total_clients} />
      <Card title="Clientes Activos" value={kpis?.active_clients} />
      <Card title="Ingresos Totales" value={`$${kpis?.total_revenue}`} />
      <Card title="Ticket Promedio" value={`$${kpis?.avg_transaction}`} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
```

---

## Configuración de n8n

### 1. Webhook para Trigger de Cliente Nuevo

**En n8n:**

```
HTTP POST Webhook
├─ URL: https://your-domain.com/api/webhooks/client-created
├─ Events: INSERT en clients
├─ Payload:
│   {
│     "client_id": "uuid",
│     "first_name": "string",
│     "phone": "string",
│     "email": "string",
│     "preferred_contact": "whatsapp|email|phone"
│   }
└─ Actions:
    ├─ Formatear mensaje de bienvenida
    ├─ Enviar via Evolution API (WhatsApp)
    └─ Registrar en notifications table
```

**Función Supabase (Database Webhook):**

```sql
-- Trigger para disparar webhook cuando se crea cliente
CREATE OR REPLACE FUNCTION notify_client_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM http_post(
    'https://hook.n8n.io/webhook/bia-client-welcome',
    jsonb_build_object(
      'client_id', NEW.id,
      'first_name', NEW.first_name,
      'phone', NEW.phone,
      'email', NEW.email,
      'preferred_contact', NEW.preferred_contact,
      'company_id', NEW.company_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_client_created
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION notify_client_created();
```

### 2. Workflow n8n: Bienvenida por WhatsApp

```json
{
  "nodes": [
    {
      "parameters": {
        "path": "bia-client-welcome",
        "authentication": "headerAuth",
        "options": {}
      },
      "id": "abc123",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "content": "=Hola {{$json.first_name}}, bienvenido a nuestro servicio de lavado. Estamos aquí para cuidar tu vehículo. 🚗✨",
        "mode": "expression"
      },
      "id": "def456",
      "name": "Construir Mensaje",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "phoneNumber": "={{$json.phone}}",
        "message": "={{$json.message}}",
        "instanceId": "{{ env.EVOLUTION_API_INSTANCE }}",
        "authentication": "bearer"
      },
      "id": "ghi789",
      "name": "Enviar WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "=https://your-domain.com/api/webhooks/notification-sent",
        "authentication": "oAuth2",
        "method": "POST",
        "options": {}
      },
      "id": "jkl012",
      "name": "Registrar Notificación",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [850, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Construir Mensaje",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Construir Mensaje": {
      "main": [
        [
          {
            "node": "Enviar WhatsApp",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar WhatsApp": {
      "main": [
        [
          {
            "node": "Registrar Notificación",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### 3. Workflow n8n: Cron Job para Recuperación de Clientes Inactivos

```json
{
  "nodes": [
    {
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyX",
              "value": 1,
              "unit": "day",
              "at": "08:00"
            }
          ]
        }
      },
      "id": "cron123",
      "name": "Trigger Diario (8 AM)",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "=https://your-domain.com/api/webhooks/clients/inactive",
        "method": "GET",
        "authentication": "bearer"
      },
      "id": "query123",
      "name": "Obtener Clientes Inactivos",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [450, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "sendText",
        "channelId": "={{$json.phone}}",
        "message": "=Hola {{$json.first_name}}, te echamos de menos. ¿Qué tal un servicio de mantenimiento para tu vehículo? 🚗\n\nCuéntanos cómo podemos ayudarte.",
        "instanceId": "{{ env.EVOLUTION_API_INSTANCE }}"
      },
      "id": "whatsapp123",
      "name": "Enviar Recuperación",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [650, 300]
    }
  ]
}
```

---

## Ejemplos de RLS

### 1. Configurar RLS para usuarios normales

```sql
-- Usuario solo ve clientes de su empresa
CREATE POLICY "Users see their company clients"
ON clients
FOR SELECT
USING (company_id = current_user_company_id());

-- Usuario solo puede crear clientes en su empresa
CREATE POLICY "Users create clients in their company"
ON clients
FOR INSERT
WITH CHECK (
  company_id = current_user_company_id()
  AND created_by = current_user_id()
);
```

### 2. Configurar RLS para auditoría (solo admins)

```sql
-- Solo admins ven auditoría
CREATE POLICY "Only admins see audit logs"
ON audit_logs
FOR SELECT
USING (
  company_id = current_user_company_id()
  AND current_user_has_role('admin'::role_name_type)
);

-- Auditoría es read-only
CREATE POLICY "Audit logs are immutable"
ON audit_logs
FOR UPDATE
USING (false);

CREATE POLICY "Cannot delete audit logs"
ON audit_logs
FOR DELETE
USING (false);
```

### 3. Testear RLS

```sql
-- Simular usuario con rol específico
SET app.current_user_id = 'user-uuid-123';
SET app.current_company_id = 'company-uuid-456';

-- Verificar que solo ve datos de su empresa
SELECT * FROM clients;  -- Solo clientes de su empresa

-- Intentar ver datos de otra empresa (fallará)
SET app.current_company_id = 'company-uuid-789';
SELECT * FROM clients;  -- Retorna 0 filas (RLS bloqueó)
```

---

## Troubleshooting

### Problema 1: `current_user_company_id()` retorna NULL

**Solución:**

```typescript
// En Next.js, setear el company_id en el header
const response = await fetch('/api/endpoint', {
  headers: {
    'x-company-id': companyId,
    'authorization': `Bearer ${token}`
  }
});

// En API Route, copiar a setting
export async function POST(request: Request) {
  const companyId = request.headers.get('x-company-id');
  
  const supabase = createClient(headers, {
    global: {
      headers: {
        'x-company-id': companyId || ''
      }
    }
  });
  
  // Ahora current_user_company_id() funcionará
}
```

### Problema 2: Transacción incompleta de venta

**Solución:**

```sql
-- Usar explicit transactions
BEGIN;

INSERT INTO sales (...) RETURNING id;
INSERT INTO sale_details (...);
UPDATE clients SET ...;

COMMIT;
-- Si hay error, ROLLBACK automático
```

### Problema 3: Rendimiento lento en reportes

**Solución: Usar vistas materializadas**

```sql
CREATE MATERIALIZED VIEW mv_monthly_sales AS
SELECT 
  DATE_TRUNC('month', sale_date) AS month,
  company_id,
  COUNT(*) AS transaction_count,
  SUM(total_amount) AS total_revenue
FROM sales
WHERE deleted_at IS NULL
AND is_cancelled = false
GROUP BY DATE_TRUNC('month', sale_date), company_id;

-- Refresh periódicamente (via cron job o manualmente)
REFRESH MATERIALIZED VIEW mv_monthly_sales;

-- Crear índice para acceso rápido
CREATE INDEX idx_mv_monthly_sales_company_month 
ON mv_monthly_sales(company_id, month DESC);
```

### Problema 4: Auditoría crece demasiado

**Solución: Archivar logs antiguos**

```sql
-- Crear tabla de archivo
CREATE TABLE audit_logs_archive (LIKE audit_logs);

-- Mover logs más antiguos de 1 año
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

-- Eliminar del original
DELETE FROM audit_logs
WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

-- Crear índice de archivo
CREATE INDEX idx_audit_logs_archive_company_date 
ON audit_logs_archive(company_id, created_at DESC);
```

---

**Fin de la Guía de Implementación**

Versión: 1.0 | Fecha: 2026-06-17
