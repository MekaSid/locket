-- Adds Connect 4 sessions and a server-side move RPC.
-- Run this after 007_pair_photo_view_updates.sql.

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.account_pairs(id) on delete cascade,
  game_type text not null check (game_type in ('connect4')),
  board integer[] not null,
  current_turn_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'finished')),
  winner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

drop policy if exists "Members can read game sessions" on public.game_sessions;
create policy "Members can read game sessions"
  on public.game_sessions
  for select
  using (
    exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = game_sessions.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  );

drop policy if exists "Members can insert game sessions" on public.game_sessions;
create policy "Members can insert game sessions"
  on public.game_sessions
  for insert
  with check (
    exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = game_sessions.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  );

drop policy if exists "Members can update game sessions" on public.game_sessions;
create policy "Members can update game sessions"
  on public.game_sessions
  for update
  using (
    exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = game_sessions.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.account_pair_members members
      join public.account_pairs pairs on pairs.id = members.pair_id
      where members.pair_id = game_sessions.pair_id
        and members.user_id = auth.uid()
        and members.left_at is null
        and pairs.status = 'active'
    )
  );

create or replace function public.get_or_create_connect4_session(target_pair_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  session_row record;
begin
  if not exists (
    select 1
    from public.account_pair_members members
    join public.account_pairs pairs on pairs.id = members.pair_id
    where members.pair_id = target_pair_id
      and members.user_id = auth.uid()
      and members.left_at is null
      and pairs.status = 'active'
  ) then
    raise exception 'You are not a member of this pair.';
  end if;

  select *
    into session_row
  from public.game_sessions
  where pair_id = target_pair_id
    and game_type = 'connect4'
  order by created_at desc
  limit 1;

  if session_row.id is null then
    insert into public.game_sessions (
      pair_id,
      game_type,
      board,
      current_turn_user_id
    )
    values (
      target_pair_id,
      'connect4',
      array_fill(0, array[42]),
      auth.uid()
    )
    returning * into session_row;
  end if;

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

create or replace function public.detect_connect4_winner(board_values integer[])
returns integer
language plpgsql
immutable
as $$
declare
  col_index integer;
  direction integer[];
  directions integer[][] := array[
    array[0, 1],
    array[1, 0],
    array[1, 1],
    array[1, -1]
  ];
  player_value integer;
  row_index integer;
begin
  for row_index in 0..5 loop
    for col_index in 0..6 loop
      player_value := board_values[(row_index * 7) + col_index + 1];

      if player_value = 0 then
        continue;
      end if;

      foreach direction slice 1 in array directions loop
        if public.has_connect4_line(board_values, row_index, col_index, direction[1], direction[2], player_value) then
          return player_value;
        end if;
      end loop;
    end loop;
  end loop;

  return 0;
end;
$$;

create or replace function public.has_connect4_line(
  board_values integer[],
  start_row integer,
  start_col integer,
  row_step integer,
  col_step integer,
  player_value integer
)
returns boolean
language plpgsql
immutable
as $$
declare
  check_col integer;
  check_row integer;
  step_index integer;
begin
  for step_index in 0..3 loop
    check_row := start_row + (row_step * step_index);
    check_col := start_col + (col_step * step_index);

    if check_row < 0 or check_row > 5 or check_col < 0 or check_col > 6 then
      return false;
    end if;

    if board_values[(check_row * 7) + check_col + 1] <> player_value then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

grant execute on function public.get_or_create_connect4_session(uuid) to authenticated;
grant execute on function public.detect_connect4_winner(integer[]) to authenticated;
grant execute on function public.has_connect4_line(integer[], integer, integer, integer, integer, integer) to authenticated;

create or replace function public.play_connect4_move(target_session_id uuid, target_column integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  session_row record;
  board_values integer[];
  board_index integer;
  placed_value integer;
  column_value integer;
  winner_value integer;
  member_index integer := 0;
  member_ids uuid[];
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

  if session_row.status <> 'active' then
    raise exception 'Game is already finished.';
  end if;

  if session_row.current_turn_user_id <> auth.uid() then
    raise exception 'It is not your turn.';
  end if;

  select array_agg(user_id order by joined_at)
    into member_ids
  from public.account_pair_members
  where pair_id = session_row.pair_id
    and left_at is null;

  if array_length(member_ids, 1) <> 2 then
    raise exception 'Connect 4 requires exactly two active members.';
  end if;

  if target_column < 0 or target_column > 6 then
    raise exception 'Column must be between 0 and 6.';
  end if;

  board_values := session_row.board;
  placed_value := case when member_ids[1] = auth.uid() then 1 else 2 end;
  board_index := null;

  for member_index in reverse 5..0 loop
    column_value := (member_index * 7) + target_column + 1;
    if board_values[column_value] = 0 then
      board_index := column_value;
      exit;
    end if;
  end loop;

  if board_index is null then
    raise exception 'This column is full.';
  end if;

  board_values[board_index] := placed_value;
  winner_value := public.detect_connect4_winner(board_values);

  update public.game_sessions
  set
    board = board_values,
    current_turn_user_id = case when placed_value = 1 then member_ids[2] else member_ids[1] end,
    status = case when winner_value > 0 or not exists (select 1 from unnest(board_values) cell where cell = 0) then 'finished' else 'active' end,
    winner_user_id = case
      when winner_value = 1 then member_ids[1]
      when winner_value = 2 then member_ids[2]
      else null
    end,
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

grant execute on function public.play_connect4_move(uuid, integer) to authenticated;
