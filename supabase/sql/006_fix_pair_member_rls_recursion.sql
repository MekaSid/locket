-- Fixes infinite recursion in account_pair_members RLS policies.
-- Run this after 005_pair_photos.sql.

drop policy if exists "Members can read pair members" on public.account_pair_members;

create policy "Users can read their own pair memberships"
  on public.account_pair_members
  for select
  using (user_id = auth.uid());

grant execute on function public.get_my_pair() to authenticated;
