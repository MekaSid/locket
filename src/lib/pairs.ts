import { supabase } from './supabase';

export type PairStatus = 'pending' | 'active' | 'ended';

export type Pair = {
  createdAt: string;
  createdBy: string;
  id: string;
  status: PairStatus;
  updatedAt: string;
};

export type PairPartner = {
  avatarPath: string | null;
  avatarUrl?: string | null;
  displayName: string | null;
  email: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
};

export type PendingInvite = {
  code: string;
  expiresAt: string;
};

export type PairSnapshot = {
  pair: Pair | null;
  partner: PairPartner | null;
  pendingInvite: PendingInvite | null;
};

export const EMPTY_PAIR_SNAPSHOT: PairSnapshot = {
  pair: null,
  partner: null,
  pendingInvite: null,
};

export function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

export function buildInviteLink(code: string) {
  return `locket://invite/${encodeURIComponent(normalizeInviteCode(code))}`;
}

export async function getMyPair() {
  if (!supabase) {
    return { data: EMPTY_PAIR_SNAPSHOT, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('get_my_pair');

  return {
    data: (data as PairSnapshot | null) ?? EMPTY_PAIR_SNAPSHOT,
    error: error?.message ?? null,
  };
}

export async function createPairInvite() {
  if (!supabase) {
    return { data: EMPTY_PAIR_SNAPSHOT, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('create_pair_invite');

  return {
    data: (data as PairSnapshot | null) ?? EMPTY_PAIR_SNAPSHOT,
    error: error?.message ?? null,
  };
}

export async function joinPairWithCode(code: string) {
  if (!supabase) {
    return { data: EMPTY_PAIR_SNAPSHOT, error: 'Supabase is not configured yet.' };
  }

  const inviteCode = normalizeInviteCode(code);

  if (!inviteCode) {
    return { data: EMPTY_PAIR_SNAPSHOT, error: 'Enter an invite code.' };
  }

  const { data, error } = await supabase.rpc('join_pair_with_code', {
    invite_code: inviteCode,
  });

  return {
    data: (data as PairSnapshot | null) ?? EMPTY_PAIR_SNAPSHOT,
    error: error?.message ?? null,
  };
}
