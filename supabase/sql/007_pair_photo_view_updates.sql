-- Allows recipients to mark pair photos as viewed.
-- Run this after 006_fix_pair_member_rls_recursion.sql.

drop policy if exists "Members can update viewed_at on incoming pair photos" on public.pair_photos;
create policy "Members can update viewed_at on incoming pair photos"
  on public.pair_photos
  for update
  using (
    sender_id <> auth.uid()
    and exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = pair_photos.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  )
  with check (
    sender_id <> auth.uid()
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
