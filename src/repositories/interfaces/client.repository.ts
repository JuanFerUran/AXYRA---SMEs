import type { Client, CreateClientInput, UpdateClientInput } from '@/features/clients/types/client';

export interface IClientRepository {
  create(data: CreateClientInput): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  update(id: string, data: UpdateClientInput): Promise<Client>;
  delete(id: string): Promise<void>;
}
