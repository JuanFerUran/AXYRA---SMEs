import type { 
  Client, 
  ClientWithRelations,
  CreateClientInput, 
  UpdateClientInput,
  ClientFilters 
} from '@/features/clients/types/client';

export interface IClientRepository {
  // Basic CRUD
  create(data: CreateClientInput): Promise<Client>;
  findById(id: string): Promise<ClientWithRelations | null>;
  findAll(filters?: ClientFilters): Promise<ClientWithRelations[]>;
  update(id: string, data: UpdateClientInput): Promise<Client>;
  delete(id: string): Promise<void>;

  // Search & Filter
  findByEmail(email: string): Promise<Client | null>;
  search(query: string, companyId: string): Promise<Client[]>;
  findActive(companyId: string, limit?: number): Promise<Client[]>;
  findInactive(companyId: string, days: number): Promise<Client[]>;
  findWithUpcomingBirthdays(companyId: string, daysAhead: number): Promise<Client[]>;

  // Statistics
  findTopByLifetimeValue(companyId: string, limit: number): Promise<ClientWithRelations[]>;
  getStats(companyId: string): Promise<{
    totalClients: number;
    activeClients: number;
    totalLifetimeValue: number;
    averageOrderValue: number;
    averageClientsPerMonth: number;
  }>;

  // Bulk Operations
  updateClientStatus(id: string, statusId: string): Promise<Client>;
  bulkUpdateStatus(ids: string[], statusId: string): Promise<number>;
}
