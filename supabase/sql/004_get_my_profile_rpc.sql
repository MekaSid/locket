-- Server-side helper for reading the current user's profile.
-- Run this after 003_profile_avatar_rpc.sql.

create or replace function public.get_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select
    id,
    email,
    first_name,
    last_name,
    display_name,
    avatar_path
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id', current_profile.id,
    'email', current_profile.email,
    'firstName', current_profile.first_name,
    'lastName', current_profile.last_name,
    'displayName', current_profile.display_name,
    'avatarPath', current_profile.avatar_path
  );
end;
$$;

grant execute on function public.get_my_profile() to authenticated;
