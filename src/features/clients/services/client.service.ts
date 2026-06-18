import type { IClientRepository } from '@/repositories/interfaces/client.repository';
import type { Client, CreateClientInput, UpdateClientInput } from '@/features/clients/types/client';

export class ClientService {
  constructor(private repo: IClientRepository) {}

  async list(): Promise<Client[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Client | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateClientInput): Promise<Client> {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateClientInput): Promise<Client> {
    return this.repo.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
