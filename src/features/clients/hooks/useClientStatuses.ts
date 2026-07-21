'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type ClientStatus = {
  id: string;
  name: string;
  description?: string | null;
  color_code?: string | null;
  is_default?: boolean | null;
};

export function useClientStatuses() {
  const [statuses, setStatuses] = useState<ClientStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('client_status')
          .select('id, name, description, color_code, is_default')
          .order('is_default', { ascending: false });

        if (!mounted) return;
        if (error) {
          setError(error);
          setStatuses([]);
        } else {
          setStatuses((data ?? []) as ClientStatus[]);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load statuses'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { statuses, isLoading, error };
}
