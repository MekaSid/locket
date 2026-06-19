import type { User } from '@supabase/supabase-js';

import { supabase } from './supabase';

export async function ensureProfile(user: User | null) {
  if (!supabase || !user) {
    return;
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    updated_at: new Date().toISOString(),
  });
}
