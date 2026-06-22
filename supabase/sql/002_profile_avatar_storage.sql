-- Adds Supabase Storage support for user profile pictures.
-- Run this after 001_profiles_and_pairing.sql.
--
-- Keep these policies intentionally simple for now. Some Supabase Storage
-- projects reject complex storage.objects policies with:
-- "The database schema is invalid or incompatible."

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own profile avatar" on storage.objects;
drop policy if exists "Users can update their own profile avatar" on storage.objects;
drop policy if exists "Users can read paired profile avatars" on storage.objects;
drop policy if exists "Authenticated users can upload profile avatars" on storage.objects;
drop policy if exists "Authenticated users can update profile avatars" on storage.objects;
drop policy if exists "Authenticated users can read profile avatars" on storage.objects;

create policy "Authenticated users can upload profile avatars"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'profile-avatars');

create policy "Authenticated users can update profile avatars"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'profile-avatars')
  with check (bucket_id = 'profile-avatars');

create policy "Authenticated users can read profile avatars"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'profile-avatars');

/*
-- Stricter owner/partner-scoped policies can replace the authenticated-only
-- policies later once basic upload is verified in this Supabase project.

create policy "Users can upload their own profile avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own profile avatar" on storage.objects;
create policy "Users can update their own profile avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read paired profile avatars" on storage.objects;
create policy "Users can read paired profile avatars"
  on storage.objects
  for select
  using (
    bucket_id = 'profile-avatars'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1
        from public.account_pair_members viewer_membership
        join public.account_pair_members owner_membership
          on owner_membership.pair_id = viewer_membership.pair_id
        join public.account_pairs pairs
          on pairs.id = viewer_membership.pair_id
        where viewer_membership.user_id = auth.uid()
          and owner_membership.user_id::text = (storage.foldername(name))[1]
          and viewer_membership.left_at is null
          and owner_membership.left_at is null
          and pairs.status = 'active'
      )
    )
  );
*/
