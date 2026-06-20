import { z } from 'zod';

// Schemas para validación de clientes
export const ClientStatusSchema = z.enum(['Active', 'Inactive', 'Prospect', 'VIP', 'Suspended']);

export const GenderSchema = z.enum(['M', 'F', 'Other']).nullable().optional();

export const PreferredContactSchema = z.enum(['email', 'phone', 'whatsapp']).nullable().optional();

// Schema para crear cliente
export const CreateClientSchema = z.object({
  company_id: z.string().uuid('company_id debe ser un UUID válido'),
  first_name: z.string().min(1, 'first_name es requerido').max(100),
  last_name: z.string().min(1, 'last_name es requerido').max(100),
  email: z.string().email('Email inválido').nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  date_of_birth: z.string().date().nullable().optional(),
  gender: GenderSchema,
  nationality: z.string().max(50).nullable().optional(),
  occupation: z.string().max(100).nullable().optional(),
  preferred_contact: PreferredContactSchema,
  avatar_url: z.string().url('URL de avatar inválida').nullable().optional(),
  
  // Datos comerciales
  client_status_id: z.string().uuid('client_status_id debe ser un UUID válido'),
  total_purchases: z.number().int().nonnegative().default(0),
  lifetime_value: z.number().nonnegative().default(0),
  last_purchase_date: z.string().date().nullable().optional(),
  average_order_value: z.number().nonnegative().nullable().optional(),
  
  // Dirección
  country: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  
  // Metadata
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().default(true),
});

// Schema para actualizar cliente
export const UpdateClientSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  date_of_birth: z.string().date().nullable().optional(),
  gender: GenderSchema,
  nationality: z.string().max(50).nullable().optional(),
  occupation: z.string().max(100).nullable().optional(),
  preferred_contact: PreferredContactSchema,
  avatar_url: z.string().url().nullable().optional(),
  
  // Datos comerciales
  client_status_id: z.string().uuid().optional(),
  total_purchases: z.number().int().nonnegative().optional(),
  lifetime_value: z.number().nonnegative().optional(),
  last_purchase_date: z.string().date().nullable().optional(),
  average_order_value: z.number().nonnegative().nullable().optional(),
  
  // Dirección
  country: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  
  // Metadata
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().optional(),
}).strict();

// Schema para query params de filtro
export const ClientFiltersSchema = z.object({
  search: z.string().optional(),
  status_id: z.string().uuid().optional(),
  is_active: z.string().transform(v => v === 'true').optional(),
  min_lifetime_value: z.string().transform(v => parseFloat(v)).optional(),
  max_lifetime_value: z.string().transform(v => parseFloat(v)).optional(),
  country: z.string().optional(),
  sort_by: z.enum(['created_at', 'lifetime_value', 'first_name', 'last_name', 'last_purchase_date', 'name']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.string().transform(v => parseInt(v)).optional(),
  offset: z.string().transform(v => parseInt(v)).optional(),
});

// Tipos derivados de los schemas
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientFilters = z.infer<typeof ClientFiltersSchema>;
