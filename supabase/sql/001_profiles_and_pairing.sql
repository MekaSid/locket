-- Baseline schema for profiles, account pairing, invite links, and pairing RPCs.
-- This is the current baseline copied from the original root supabase.sql.
-- New database changes should be added as separate numbered files in this directory.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.account_pairs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'active', 'ended')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.account_pair_members (
  pair_id uuid not null references public.account_pairs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (pair_id, user_id)
);

create unique index if not exists one_current_pair_per_user
  on public.account_pair_members(user_id)
  where left_at is null;

create table if not exists public.pair_invites (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.account_pairs(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null
);

alter table public.account_pairs enable row level security;
alter table public.account_pair_members enable row level security;
alter table public.pair_invites enable row level security;

drop policy if exists "Members can read their pairs" on public.account_pairs;
create policy "Members can read their pairs"
  on public.account_pairs
  for select
  using (
    exists (
      select 1
      from public.account_pair_members members
      where members.pair_id = account_pairs.id
        and members.user_id = auth.uid()
        and members.left_at is null
    )
  );

drop policy if exists "Members can read pair members" on public.account_pair_members;
create policy "Members can read pair members"
  on public.account_pair_members
  for select
  using (
    exists (
      select 1
      from public.account_pair_members my_membership
      where my_membership.pair_id = account_pair_members.pair_id
        and my_membership.user_id = auth.uid()
        and my_membership.left_at is null
    )
  );

drop policy if exists "Invite creators can read their invites" on public.pair_invites;
create policy "Invite creators can read their invites"
  on public.pair_invites
  for select
  using (created_by = auth.uid());

create or replace function public.get_my_pair()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_pair record;
  partner record;
  pending_invite record;
begin
  select pairs.id, pairs.status, pairs.created_by, pairs.created_at, pairs.updated_at
    into current_pair
  from public.account_pairs pairs
  join public.account_pair_members members on members.pair_id = pairs.id
  where members.user_id = auth.uid()
    and members.left_at is null
    and pairs.status in ('pending', 'active')
  order by pairs.created_at desc
  limit 1;

  if current_pair.id is null then
    return jsonb_build_object('pair', null, 'partner', null, 'pendingInvite', null);
  end if;

  select profiles.id, profiles.email, profiles.first_name, profiles.last_name, profiles.display_name, profiles.avatar_path
    into partner
  from public.account_pair_members members
  join public.profiles profiles on profiles.id = members.user_id
  where members.pair_id = current_pair.id
    and members.user_id <> auth.uid()
    and members.left_at is null
  limit 1;

  select invites.code, invites.expires_at
    into pending_invite
  from public.pair_invites invites
  where invites.pair_id = current_pair.id
    and invites.created_by = auth.uid()
    and invites.used_at is null
    and invites.expires_at > now()
  order by invites.created_at desc
  limit 1;

  return jsonb_build_object(
    'pair',
    jsonb_build_object(
      'id', current_pair.id,
      'status', current_pair.status,
      'createdBy', current_pair.created_by,
      'createdAt', current_pair.created_at,
      'updatedAt', current_pair.updated_at
    ),
    'partner',
    case
      when partner.id is null then null
      else jsonb_build_object(
        'id', partner.id,
        'email', partner.email,
        'firstName', partner.first_name,
        'lastName', partner.last_name,
        'displayName', partner.display_name,
        'avatarPath', partner.avatar_path
      )
    end,
    'pendingInvite',
    case
      when pending_invite.code is null then null
      else jsonb_build_object(
        'code', pending_invite.code,
        'expiresAt', pending_invite.expires_at
      )
    end
  );
end;
$$;

create or replace function public.create_pair_invite()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing_pair record;
  invite_code text;
  invite_expires_at timestamptz := now() + interval '24 hours';
begin
  select pairs.id, pairs.status
    into existing_pair
  from public.account_pairs pairs
  join public.account_pair_members members on members.pair_id = pairs.id
  where members.user_id = auth.uid()
    and members.left_at is null
    and pairs.status in ('pending', 'active')
  limit 1;

  if existing_pair.status = 'active' then
    raise exception 'You are already paired.';
  end if;

  if existing_pair.id is null then
    insert into public.account_pairs (created_by)
    values (auth.uid())
    returning id, status into existing_pair;

    insert into public.account_pair_members (pair_id, user_id)
    values (existing_pair.id, auth.uid());
  end if;

  update public.pair_invites
  set used_at = now()
  where pair_id = existing_pair.id
    and used_at is null;

  loop
    invite_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (select 1 from public.pair_invites where code = invite_code);
  end loop;

  insert into public.pair_invites (pair_id, code, created_by, expires_at)
  values (existing_pair.id, invite_code, auth.uid(), invite_expires_at);

  return public.get_my_pair();
end;
$$;

create or replace function public.join_pair_with_code(invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  invite record;
  existing_membership record;
begin
  select *
    into existing_membership
  from public.account_pair_members members
  join public.account_pairs pairs on pairs.id = members.pair_id
  where members.user_id = auth.uid()
    and members.left_at is null
    and pairs.status in ('pending', 'active')
  limit 1;

  if existing_membership.pair_id is not null then
    raise exception 'You are already paired.';
  end if;

  select *
    into invite
  from public.pair_invites
  where code = upper(trim(invite_code))
  limit 1;

  if invite.id is null then
    raise exception 'Invite code not found.';
  end if;

  if invite.created_by = auth.uid() then
    raise exception 'You cannot join your own invite.';
  end if;

  if invite.used_at is not null then
    raise exception 'Invite code has already been used.';
  end if;

  if invite.expires_at <= now() then
    raise exception 'Invite code has expired.';
  end if;

  insert into public.account_pair_members (pair_id, user_id)
  values (invite.pair_id, auth.uid());

  update public.account_pairs
  set status = 'active',
      updated_at = now()
  where id = invite.pair_id;

  update public.pair_invites
  set used_at = now(),
      used_by = auth.uid()
  where id = invite.id;

  return public.get_my_pair();
end;
$$;

grant execute on function public.get_my_pair() to authenticated;
grant execute on function public.create_pair_invite() to authenticated;
grant execute on function public.join_pair_with_code(text) to authenticated;
