import type { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { ensureProfile } from '../lib/profiles';
import { supabase } from '../lib/supabase';

type AuthResult = {
  error: string | null;
};

type AuthContextValue = {
  initialized: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(!supabase);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      session,
      user: session?.user ?? null,
      signIn: async (email, password) => {
        if (!supabase) {
          return { error: 'Supabase is not configured yet.' };
        }

        if (!email || !password) {
          return { error: 'Enter your email and password.' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          return { error: error.message };
        }

        await ensureProfile(data.user);

        router.replace('/home');
        return { error: null };
      },
      signUp: async (email, password) => {
        if (!supabase) {
          return { error: 'Supabase is not configured yet.' };
        }

        if (!email || !password) {
          return { error: 'Enter your email and password.' };
        }

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          return { error: error.message };
        }

        await ensureProfile(data.user);

        if (data.session) {
          router.replace('/home');
        }

        return { error: null };
      },
      signOut: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }

        setSession(null);
        router.replace('/login');
      },
    }),
    [initialized, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
