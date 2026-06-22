-- Server-side helper for saving the current user's profile avatar path.
-- Run this after 002_profile_avatar_storage.sql.

create or replace function public.set_my_profile_avatar(next_avatar_path text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_profile record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  insert into public.profiles (
    id,
    avatar_path,
    display_name,
    updated_at
  )
  values (
    auth.uid(),
    nullif(trim(next_avatar_path), ''),
    'Sid',
    now()
  )
  on conflict (id) do update
  set
    avatar_path = excluded.avatar_path,
    updated_at = now()
  returning
    id,
    email,
    first_name,
    last_name,
    display_name,
    avatar_path
  into saved_profile;

  return jsonb_build_object(
    'id', saved_profile.id,
    'email', saved_profile.email,
    'firstName', saved_profile.first_name,
    'lastName', saved_profile.last_name,
    'displayName', saved_profile.display_name,
    'avatarPath', saved_profile.avatar_path
  );
end;
$$;

grant execute on function public.set_my_profile_avatar(text) to authenticated;
