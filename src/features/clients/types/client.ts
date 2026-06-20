// Tipos base
export type Client = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: 'M' | 'F' | 'Other' | null;
  nationality?: string | null;
  occupation?: string | null;
  preferred_contact?: 'email' | 'phone' | 'whatsapp' | null;
  avatar_url?: string | null;
  
  // Datos comerciales
  client_status_id: string;
  total_purchases: number;
  lifetime_value: number;
  last_purchase_date?: string | null;
  average_order_value?: number | null;
  
  // Datos de dirección
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postal_code?: string | null;
  address?: string | null;
  
  // Metadata
  tags?: string[] | null;
  notes?: string | null;
  is_active: boolean;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type ClientStatus = {
  id: string;
  name: 'Active' | 'Inactive' | 'Prospect' | 'VIP' | 'Suspended';
  description?: string;
  color?: string;
};

export type ClientWithRelations = Client & {
  status?: ClientStatus;
  vehicles_count?: number;
  total_services?: number;
  pending_orders?: number;
  vehicles?: Array<{ id: string }>;
  sales?: Array<{
    id: string;
    created_at: string;
    amount?: number;
    status?: string;
    description?: string;
  }>;
};

// Input types
export type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export type UpdateClientInput = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company_id'>>;

export type ClientFilters = {
  search?: string;
  status_id?: string;
  is_active?: boolean;
  min_lifetime_value?: number;
  max_lifetime_value?: number;
  country?: string;
  company_id?: string;
  sort_by?: 'created_at' | 'lifetime_value' | 'first_name' | 'last_name' | 'last_purchase_date' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};
