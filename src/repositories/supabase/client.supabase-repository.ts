import { supabase } from '@/lib/supabaseClient';
import type { 
  Client, 
  ClientWithRelations,
  CreateClientInput, 
  UpdateClientInput,
  ClientFilters 
} from '@/features/clients/types/client';
import type { IClientRepository } from '@/repositories/interfaces/client.repository';

export class ClientSupabaseRepository implements IClientRepository {
  private table = 'clients';

  async create(data: CreateClientInput): Promise<Client> {
    const { data: row, error } = await supabase
      .from(this.table)
      .insert([data as Record<string, unknown>])
      .select()
      .single();

    if (error) throw error;
    return row as Client;
  }

  async findById(id: string): Promise<ClientWithRelations | null> {
    const { data: row, error } = await supabase
      .from(this.table)
      .select(`
        *,
        status:client_status_id(id, name, description, color),
        vehicles(id),
        sales(id, created_at, amount, status, description)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    const client = row as any;
    return {
      ...client,
      vehicles_count: client.vehicles?.length || 0,
      total_services: client.sales?.length || 0,
    } as ClientWithRelations;
  }

  async findAll(filters?: ClientFilters): Promise<ClientWithRelations[]> {
    let query = supabase
      .from(this.table)
      .select(`
        *,
        status:client_status_id(id, name, description, color),
        vehicles(id),
        sales(id)
      `);

    if (filters?.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.status_id) {
      query = query.eq('client_status_id', filters.status_id);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.country) {
      query = query.eq('country', filters.country);
    }

    if (filters?.min_lifetime_value) {
      query = query.gte('lifetime_value', filters.min_lifetime_value);
    }

    if (filters?.max_lifetime_value) {
      query = query.lte('lifetime_value', filters.max_lifetime_value);
    }

    const sortBy = filters?.sort_by || 'created_at';
    const ascending = (filters?.sort_order || 'desc') === 'asc';
    
    query = query.order(sortBy, { ascending });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    return ((data ?? []) as any[]).map(client => ({
      ...client,
      vehicles_count: client.vehicles?.length || 0,
      total_services: client.sales?.length || 0,
    })) as ClientWithRelations[];
  }

  async update(id: string, dataInput: UpdateClientInput): Promise<Client> {
    const { data: row, error } = await supabase
      .from(this.table)
      .update(dataInput)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return row as Client;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const { data: row, error } = await supabase
      .from(this.table)
      .select()
      .eq('email', email)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    return row as Client;
  }

  async search(query: string, companyId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select()
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
      )
      .limit(20);

    if (error) throw error;
    return (data ?? []) as Client[];
  }

  async findActive(companyId: string, limit?: number): Promise<Client[]> {
    let queryBuilder = supabase
      .from(this.table)
      .select()
      .eq('company_id', companyId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return (data ?? []) as Client[];
  }

  async findInactive(companyId: string, days: number): Promise<Client[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select()
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .lt('last_purchase_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
    return (data ?? []) as Client[];
  }

  async findWithUpcomingBirthdays(companyId: string, daysAhead: number): Promise<Client[]> {
    const { data, error } = await supabase
      .rpc('find_upcoming_birthdays', {
        p_company_id: companyId,
        p_days_ahead: daysAhead,
      });

    if (error) throw error;
    return (data ?? []) as Client[];
  }

  async findTopByLifetimeValue(companyId: string, limit: number): Promise<ClientWithRelations[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        status:client_status_id(id, name, description, color),
        vehicles(id),
        sales(id)
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('lifetime_value', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data ?? []) as any[]).map(client => ({
      ...client,
      vehicles_count: client.vehicles?.length || 0,
      total_services: client.sales?.length || 0,
    })) as ClientWithRelations[];
  }

  async getStats(companyId: string): Promise<{
    totalClients: number;
    activeClients: number;
    totalLifetimeValue: number;
    averageOrderValue: number;
    averageClientsPerMonth: number;
  }> {
    const { data, error } = await supabase
      .rpc('get_client_stats', { p_company_id: companyId });

    if (error) throw error;

    const stats = data?.[0] || {};
    return {
      totalClients: stats.total_clients || 0,
      activeClients: stats.active_clients || 0,
      totalLifetimeValue: stats.total_lifetime_value || 0,
      averageOrderValue: stats.average_order_value || 0,
      averageClientsPerMonth: stats.average_clients_per_month || 0,
    };
  }

  async updateClientStatus(id: string, statusId: string): Promise<Client> {
    const { data: row, error } = await supabase
      .from(this.table)
      .update({ client_status_id: statusId })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return row as Client;
  }

  async bulkUpdateStatus(ids: string[], statusId: string): Promise<number> {
    const { error, data } = await supabase
      .from(this.table)
      .update({ client_status_id: statusId })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data?.length || 0;
  }
}
