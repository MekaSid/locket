-- Adds pair-scoped photo sending.
-- Run this after 004_get_my_profile_rpc.sql if you applied it, otherwise after 003_profile_avatar_rpc.sql.

insert into storage.buckets (id, name, public)
values ('pair-photos', 'pair-photos', false)
on conflict (id) do nothing;

create table if not exists public.pair_photos (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.account_pairs(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  expires_at timestamptz
);

alter table public.pair_photos enable row level security;

drop policy if exists "Members can read pair photos" on public.pair_photos;
create policy "Members can read pair photos"
  on public.pair_photos
  for select
  using (
    exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = pair_photos.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  );

drop policy if exists "Members can insert pair photos" on public.pair_photos;
create policy "Members can insert pair photos"
  on public.pair_photos
  for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = pair_photos.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  );

drop policy if exists "Authenticated users can upload pair photos" on storage.objects;
drop policy if exists "Authenticated users can read pair photos" on storage.objects;

create policy "Authenticated users can upload pair photos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'pair-photos');

create policy "Authenticated users can read pair photos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'pair-photos');
