import type { User } from '@supabase/supabase-js';

import { supabase } from './supabase';

const PROFILE_AVATAR_BUCKET = 'profile-avatars';

export type Profile = {
  avatarPath: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  firstName: string | null;
  id: string;
  lastName: string | null;
};

type ProfileRow = {
  avatar_path: string | null;
  display_name: string | null;
  email: string | null;
  first_name: string | null;
  id: string;
  last_name: string | null;
};

type ProfileInput = {
  avatarPath?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type UploadProfileAvatarInput = {
  mimeType?: string | null;
  uri: string;
  userId: string;
};

export function getProfileDisplayName(profile: Pick<Profile, 'displayName' | 'email' | 'firstName'> | null) {
  return profile?.firstName?.trim() || profile?.displayName?.trim() || 'Sid';
}

export async function ensureProfile(user: User | null, input: ProfileInput = {}) {
  if (!supabase || !user) {
    return;
  }

  const existing = await getMyProfile(user.id);

  if (existing.data && input.firstName === undefined && input.lastName === undefined && input.avatarPath === undefined) {
    await supabase
      .from('profiles')
      .update({
        email: user.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    return;
  }

  const firstName = input.firstName?.trim() || null;
  const lastName = input.lastName?.trim() || null;
  const displayName = firstName || user.email?.split('@')[0] || null;

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    avatar_path: input.avatarPath ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
}

export async function getMyProfile(userId: string | null | undefined) {
  if (!supabase || !userId) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .limit(1);

  const profile = data?.[0] ? await hydrateProfileRow(data[0] as ProfileRow) : null;

  return {
    data: profile,
    error: error?.message ?? null,
  };
}

export async function hydrateProfileRow(row: ProfileRow): Promise<Profile> {
  return {
    avatarPath: row.avatar_path,
    avatarUrl: await getProfileAvatarUrl(row.avatar_path),
    displayName: row.display_name,
    email: row.email,
    firstName: row.first_name,
    id: row.id,
    lastName: row.last_name,
  };
}

export async function updateMyProfile(userId: string, input: ProfileInput) {
  if (!supabase) {
    return { error: 'Supabase is not configured yet.' };
  }

  const profileUpdate: {
    avatar_path?: string | null;
    display_name: string;
    first_name: string | null;
    id: string;
    last_name: string | null;
    updated_at: string;
  } = {
    display_name: input.firstName?.trim() || 'Sid',
    first_name: input.firstName?.trim() || null,
    id: userId,
    last_name: input.lastName?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (input.avatarPath !== undefined) {
    profileUpdate.avatar_path = input.avatarPath?.trim() || null;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileUpdate, { onConflict: 'id' });

  return { error: error?.message ?? null };
}

export async function saveMyProfileAvatarPath(path: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.rpc('set_my_profile_avatar', {
    next_avatar_path: path,
  });

  const savedProfile = data
    ? {
        avatarPath: data.avatarPath,
        avatarUrl: await getProfileAvatarUrl(data.avatarPath),
        displayName: data.displayName,
        email: data.email,
        firstName: data.firstName,
        id: data.id,
        lastName: data.lastName,
      }
    : null;

  return {
    data: savedProfile,
    error: error?.message ?? null,
  };
}

export async function uploadProfileAvatar({ mimeType, uri, userId }: UploadProfileAvatarInput) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = mimeType || 'image/jpeg';
  const extension = getImageExtension(contentType);
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: path, error: null };
}

export async function getProfileAvatarUrl(path: string | null | undefined) {
  if (!supabase || !path) {
    return null;
  }

  const publicUrl = supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    return publicUrl;
  }

  return data.signedUrl || publicUrl;
}

function getImageExtension(mimeType: string) {
  if (mimeType.includes('png')) {
    return 'png';
  }

  if (mimeType.includes('webp')) {
    return 'webp';
  }

  return 'jpg';
}
