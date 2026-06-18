import { supabase } from '@/lib/supabaseClient';
import type { Client, CreateClientInput, UpdateClientInput } from '@/features/clients/types/client';
import type { IClientRepository } from '@/repositories/interfaces/client.repository';

export class ClientSupabaseRepository implements IClientRepository {
  private table = 'clients';

  async create(data: CreateClientInput): Promise<Client> {
    const { data: row, error } = await supabase
      .from(this.table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return row as Client;
  }

  async findById(id: string): Promise<Client | null> {
    const { data: row, error } = await supabase.from(this.table).select().eq('id', id).single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null; // not found
      throw error;
    }
    return row as Client;
  }

  async findAll(): Promise<Client[]> {
    const { data, error } = await supabase.from(this.table).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Client[];
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
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw error;
  }
}
