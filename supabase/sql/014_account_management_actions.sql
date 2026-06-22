-- Adds unpair and delete-account actions for the signed-in user.
-- Run this after 013_fix_connect4_rematch_function.sql.

create or replace function public.end_current_pair()
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  current_pair_id uuid;
begin
  select pairs.id
    into current_pair_id
  from public.account_pairs pairs
  join public.account_pair_members members on members.pair_id = pairs.id
  where members.user_id = auth.uid()
    and members.left_at is null
    and pairs.status in ('pending', 'active')
  order by pairs.created_at desc
  limit 1;

  if current_pair_id is null then
    return;
  end if;

  update public.account_pair_members
  set left_at = coalesce(left_at, now())
  where pair_id = current_pair_id;

  update public.account_pairs
  set status = 'ended',
      ended_at = coalesce(ended_at, now()),
      updated_at = now()
  where id = current_pair_id;

  update public.pair_invites
  set used_at = coalesce(used_at, now())
  where pair_id = current_pair_id
    and used_at is null;
end;
$$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  perform public.end_current_pair();

  delete from auth.users
  where id = auth.uid();
end;
$$;

grant execute on function public.end_current_pair() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
