-- Adds rematch flow for Connect 4 sessions.
-- Run this after 008_connect4_sessions.sql.

create or replace function public.start_new_connect4_round(target_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  member_ids uuid[];
  next_turn_user_id uuid;
  session_row record;
begin
  select *
    into session_row
  from public.game_sessions
  where id = target_session_id
    and game_type = 'connect4'
  limit 1;

  if session_row.id is null then
    raise exception 'Game session not found.';
  end if;

  if session_row.status <> 'finished' then
    raise exception 'This round is still active.';
  end if;

  if not exists (
    select 1
    from public.account_pair_members members
    join public.account_pairs pairs on pairs.id = members.pair_id
    where members.pair_id = session_row.pair_id
      and members.user_id = auth.uid()
      and members.left_at is null
      and pairs.status = 'active'
  ) then
    raise exception 'You are not a member of this pair.';
  end if;

  select array_agg(user_id order by joined_at)
    into member_ids
  from public.account_pair_members
  where pair_id = session_row.pair_id
    and left_at is null;

  if array_length(member_ids, 1) <> 2 then
    raise exception 'Connect 4 requires exactly two active members.';
  end if;

  next_turn_user_id := case
    when session_row.current_turn_user_id = member_ids[1] then member_ids[2]
    else member_ids[1]
  end;

  update public.game_sessions
  set
    board = array_fill(0, array[42]),
    current_turn_user_id = next_turn_user_id,
    status = 'active',
    winner_user_id = null,
    updated_at = now()
  where id = target_session_id
  returning * into session_row;

  return jsonb_build_object(
    'id', session_row.id,
    'pairId', session_row.pair_id,
    'gameType', session_row.game_type,
    'board', session_row.board,
    'currentTurnUserId', session_row.current_turn_user_id,
    'status', session_row.status,
    'winnerUserId', session_row.winner_user_id,
    'createdAt', session_row.created_at,
    'updatedAt', session_row.updated_at
  );
end;
$$;

grant execute on function public.start_new_connect4_round(uuid) to authenticated;
