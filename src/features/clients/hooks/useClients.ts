'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ClientService } from '@/features/clients/services/client.service';
import { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';
import type {
  Client,
  ClientWithRelations,
  CreateClientInput,
  UpdateClientInput,
  ClientFilters,
} from '@/features/clients/types/client';

const repository = new ClientSupabaseRepository();
const clientService = new ClientService(repository);

interface UseClientsOptions {
  filters?: ClientFilters;
  companyId?: string;
  autoFetch?: boolean;
}

export function useClients(options: UseClientsOptions = {}) {
  const { filters = {}, companyId, autoFetch = true } = options;

  const mergedFilters = useMemo(
    () => ({
      ...filters,
      ...(companyId ? { company_id: companyId } : {}),
    }),
    [filters, companyId]
  );

  const [clients, setClients] = useState<ClientWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.list(mergedFilters);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('useClients fetch failed:', err);
      setClients([]);
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
    } finally {
      setIsLoading(false);
    }
  }, [mergedFilters]);

  const createClient = useCallback(
    async (input: CreateClientInput) => {
      try {
        const newClient = await clientService.create(input);
        setClients((prev) => [...prev, newClient as ClientWithRelations]);
        return newClient;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create client');
        setError(error);
        throw error;
      }
    },
    []
  );

  const updateClient = useCallback(async (id: string, input: UpdateClientInput) => {
    try {
      const updated = await clientService.update(id, input);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      );
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update client');
      setError(error);
      throw error;
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      await clientService.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete client');
      setError(error);
      throw error;
    }
  }, []);

  const getClient = useCallback(
    async (id: string) => {
      try {
        return await clientService.get(id);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch client');
        setError(error);
        throw error;
      }
    },
    []
  );

  const searchClients = useCallback(
    async (query: string, companyId: string) => {
      try {
        return await clientService.searchClients(query, companyId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to search clients');
        setError(error);
        throw error;
      }
    },
    []
  );

  const getActiveClients = useCallback(
    async (companyId: string) => {
      try {
        return await clientService.getActiveClients(companyId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch active clients');
        setError(error);
        throw error;
      }
    },
    []
  );

  const getTopClients = useCallback(
    async (companyId: string, limit?: number) => {
      try {
        return await clientService.getTopClients(companyId, limit);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch top clients');
        setError(error);
        throw error;
      }
    },
    []
  );

  const getInactiveClients = useCallback(
    async (companyId: string, days?: number) => {
      try {
        return await clientService.getInactiveClients(companyId, days);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch inactive clients');
        setError(error);
        throw error;
      }
    },
    []
  );

  const getBirthdayClients = useCallback(
    async (companyId: string, daysAhead?: number) => {
      try {
        return await clientService.getBirthdayClients(companyId, daysAhead);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch birthday clients');
        setError(error);
        throw error;
      }
    },
    []
  );

  const getClientStats = useCallback(
    async (companyId: string) => {
      try {
        return await clientService.getClientStats(companyId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch client stats');
        setError(error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchClients();
    }
  }, [autoFetch, fetchClients]);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    searchClients,
    getActiveClients,
    getTopClients,
    getInactiveClients,
    getBirthdayClients,
    getClientStats,
  };
}
