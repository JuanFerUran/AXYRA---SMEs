'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);

      const metadataCompanyId =
        data.session?.user.app_metadata?.company_id ||
        data.session?.user.user_metadata?.company_id ||
        process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID ||
        null;

      setCompanyId(typeof metadataCompanyId === 'string' ? metadataCompanyId : null);
      setIsLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      const metadataCompanyId =
        session?.user.app_metadata?.company_id ||
        session?.user.user_metadata?.company_id ||
        process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID ||
        null;
      setCompanyId(typeof metadataCompanyId === 'string' ? metadataCompanyId : null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCompanyId(null);
  };

  return {
    session,
    user,
    companyId,
    isLoading,
    isAuthenticated: Boolean(session),
    signOut,
  };
}
