import type { IClientRepository } from '@/repositories/interfaces/client.repository';
import type { 
  Client, 
  ClientWithRelations,
  CreateClientInput, 
  UpdateClientInput,
  ClientFilters 
} from '@/features/clients/types/client';

export class ClientService {
  constructor(private repo: IClientRepository) {}

  // CRUD Operations
  async list(filters?: ClientFilters): Promise<ClientWithRelations[]> {
    return this.repo.findAll(filters);
  }

  async get(id: string): Promise<ClientWithRelations | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateClientInput): Promise<Client> {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateClientInput): Promise<Client> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  // Business Logic Operations
  async getByEmail(email: string): Promise<Client | null> {
    return this.repo.findByEmail(email);
  }

  async searchClients(query: string, companyId: string): Promise<Client[]> {
    return this.repo.search(query, companyId);
  }

  async getActiveClients(companyId: string, limit?: number): Promise<Client[]> {
    return this.repo.findActive(companyId, limit);
  }

  async getTopClients(companyId: string, limit: number = 10): Promise<ClientWithRelations[]> {
    return this.repo.findTopByLifetimeValue(companyId, limit);
  }

  async getInactiveClients(companyId: string, days: number = 60): Promise<Client[]> {
    return this.repo.findInactive(companyId, days);
  }

  async getBirthdayClients(companyId: string, daysAhead: number = 7): Promise<Client[]> {
    return this.repo.findWithUpcomingBirthdays(companyId, daysAhead);
  }

  async updateStatus(id: string, statusId: string): Promise<Client> {
    return this.repo.updateClientStatus(id, statusId);
  }

  async bulkUpdateStatus(ids: string[], statusId: string): Promise<number> {
    return this.repo.bulkUpdateStatus(ids, statusId);
  }

  async getClientStats(companyId: string): Promise<{
    totalClients: number;
    activeClients: number;
    totalLifetimeValue: number;
    averageOrderValue: number;
    averageClientsPerMonth: number;
  }> {
    return this.repo.getStats(companyId);
  }

  async exportClients(companyId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const clients = await this.repo.findAll({ limit: 10000 });
    
    if (format === 'json') {
      return JSON.stringify(clients, null, 2);
    }

    // CSV Export
    const headers = [
      'ID', 'Nombre', 'Apellido', 'Correo', 'Teléfono',
      'Compras totales', 'Valor de vida', 'Última compra', 'Estado'
    ];
    
    const rows = clients.map(client => [
      client.id,
      client.first_name,
      client.last_name,
      client.email || '',
      client.phone || '',
      client.total_purchases,
      client.lifetime_value,
      client.last_purchase_date || '',
      (client as any).status?.name ?? ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }
}
