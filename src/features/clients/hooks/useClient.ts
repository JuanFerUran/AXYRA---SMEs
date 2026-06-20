'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientService } from '@/features/clients/services/client.service';
import { ClientSupabaseRepository } from '@/repositories/supabase/client.supabase-repository';
import type { ClientWithRelations } from '@/features/clients/types/client';

const repository = new ClientSupabaseRepository();
const clientService = new ClientService(repository);

export function useClient(clientId: string | null) {
  const [client, setClient] = useState<ClientWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await clientService.get(clientId);
      setClient(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load client'));
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void fetchClient();
  }, [fetchClient]);

  return {
    client,
    isLoading,
    error,
    fetchClient,
  };
}
