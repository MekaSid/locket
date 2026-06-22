import type { RealtimeChannel } from '@supabase/supabase-js';

import type { Connect4Session } from './connect4';
import { supabase } from './supabase';

export async function getOrCreateConnect4Session(pairId: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('get_or_create_connect4_session', {
    target_pair_id: pairId,
  });

  return {
    data: (data as Connect4Session | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function playConnect4Move(sessionId: string, column: number) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('play_connect4_move', {
    target_column: column,
    target_session_id: sessionId,
  });

  return {
    data: (data as Connect4Session | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function startNewConnect4Round(sessionId: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('start_new_connect4_round', {
    target_session_id: sessionId,
  });

  return {
    data: (data as Connect4Session | null) ?? null,
    error: error?.message ?? null,
  };
}

export function subscribeToConnect4Session(sessionId: string, onChange: () => void) {
  if (!supabase) {
    return { unsubscribe: () => undefined };
  }

  const client = supabase;
  const channel: RealtimeChannel = client
    .channel(`connect4-session-${sessionId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_sessions',
        filter: `id=eq.${sessionId}`,
      },
      onChange,
    )
    .subscribe();

  return {
    unsubscribe: () => {
      client.removeChannel(channel);
    },
  };
}
