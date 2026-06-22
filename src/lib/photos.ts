import { supabase } from './supabase';

const PAIR_PHOTOS_BUCKET = 'pair-photos';

export type PairPhoto = {
  caption: string | null;
  createdAt: string;
  id: string;
  pairId: string;
  senderId: string;
  storagePath: string;
  url: string | null;
  viewedAt: string | null;
};

type SendPairPhotoInput = {
  caption?: string | null;
  imageUri: string;
  pairId: string;
  senderId: string;
};

export async function listPairPhotos(pairId: string) {
  if (!supabase) {
    return { data: [], error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase
    .from('pair_photos')
    .select('id, pair_id, sender_id, storage_path, caption, created_at, viewed_at')
    .eq('pair_id', pairId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    return { data: [], error: error.message };
  }

  const photos = await Promise.all((data ?? []).map(hydratePairPhoto));

  return { data: photos, error: null };
}

export async function getPairPhotoOpenUrl(storagePath: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase.storage
    .from(PAIR_PHOTOS_BUCKET)
    .createSignedUrl(storagePath, 60);

  return {
    data: data?.signedUrl ?? null,
    error: error?.message ?? null,
  };
}

export async function getLatestIncomingPairPhoto(pairId: string, userId: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase
    .from('pair_photos')
    .select('id, pair_id, sender_id, storage_path, caption, created_at, viewed_at')
    .eq('pair_id', pairId)
    .neq('sender_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data ? await hydratePairPhoto(data) : null,
    error: null,
  };
}

export async function getLatestSentPairPhoto(pairId: string, userId: string) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const { data, error } = await supabase
    .from('pair_photos')
    .select('id, pair_id, sender_id, storage_path, caption, created_at, viewed_at')
    .eq('pair_id', pairId)
    .eq('sender_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data ? await hydratePairPhoto(data) : null,
    error: null,
  };
}

export async function markPairPhotoViewed(photoId: string) {
  if (!supabase) {
    return { error: 'Supabase is not configured yet.' };
  }

  const { error } = await supabase
    .from('pair_photos')
    .update({
      viewed_at: new Date().toISOString(),
    })
    .eq('id', photoId)
    .is('viewed_at', null);

  return { error: error?.message ?? null };
}

export async function sendPairPhoto({ caption, imageUri, pairId, senderId }: SendPairPhotoInput) {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured yet.' };
  }

  const storagePath = `${pairId}/${createPhotoKey()}.jpg`;
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const upload = await supabase.storage
    .from(PAIR_PHOTOS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (upload.error) {
    return { data: null, error: upload.error.message };
  }

  const insert = await supabase
    .from('pair_photos')
    .insert({
      caption: caption?.trim() || null,
      pair_id: pairId,
      sender_id: senderId,
      storage_path: storagePath,
    })
    .select('id, pair_id, sender_id, storage_path, caption, created_at, viewed_at')
    .single();

  if (insert.error) {
    return { data: null, error: insert.error.message };
  }

  return { data: await hydratePairPhoto(insert.data), error: null };
}

async function hydratePairPhoto(row: {
  caption: string | null;
  created_at: string;
  id: string;
  pair_id: string;
  sender_id: string;
  storage_path: string;
  viewed_at?: string | null;
}): Promise<PairPhoto> {
  return {
    caption: row.caption,
    createdAt: row.created_at,
    id: row.id,
    pairId: row.pair_id,
    senderId: row.sender_id,
    storagePath: row.storage_path,
    url: null,
    viewedAt: row.viewed_at ?? null,
  };
}

function createPhotoKey() {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
