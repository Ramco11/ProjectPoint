create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  email text,
  full_name text,

  created_at timestamptz
    default now()
);

create table public.projects (
  id uuid primary key
    default gen_random_uuid(),

  name text not null,
  contract_number text,
  location text,

  contract_value numeric
    default 0,

  start_date date,
  completion_date date,
  onedrive_url text,

  created_by uuid
    references auth.users(id),

  created_at timestamptz
    default now()
);

create table public.project_members (
  project_id uuid
    references public.projects(id)
    on delete cascade,

  user_id uuid
    references auth.users(id)
    on delete cascade,

  role text not null
    check (
      role in (
        'owner',
        'admin',
        'manager',
        'reviewer',
        'viewer'
      )
    ),

  primary key (
    project_id,
    user_id
  )
);

create table public.records (
  id uuid primary key
    default gen_random_uuid(),

  project_id uuid
    references public.projects(id)
    on delete cascade,

  type text not null,
  reference text not null,
  title text not null,

  amount numeric
    default 0,

  responsible_party text,

  status text
    default 'Pending',

  due_date date,
  notes text,

  created_by uuid
    references auth.users(id),

  created_at timestamptz
    default now(),

  updated_at timestamptz
    default now(),

  unique (
    project_id,
    reference
  )
);

create table public.project_counters (
  project_id uuid
    references public.projects(id)
    on delete cascade,

  record_type text,
  prefix text,

  counter integer
    default 0,

  primary key (
    project_id,
    record_type
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    email
  )
  values (
    new.id,
    new.email
  );

  return new;

end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.next_project_reference (
  p_project_id uuid,
  p_record_type text,
  p_prefix text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin

  if not exists (
    select 1
    from public.project_members
    where
      project_id = p_project_id
      and user_id = auth.uid()
      and role in (
        'owner',
        'admin',
        'manager'
      )
  )
  then
    raise exception 'Not authorized';
  end if;

  insert into public.project_counters (
    project_id,
    record_type,
    prefix,
    counter
  )
  values (
    p_project_id,
    p_record_type,
    p_prefix,
    1
  )
  on conflict (
    project_id,
    record_type
  )
  do update
  set counter =
    public.project_counters.counter + 1
  returning counter into n;

  return
    p_prefix ||
    '-' ||
    lpad(
      n::text,
      3,
      '0'
    );

end;
$$;

alter table public.profiles
enable row level security;

alter table public.projects
enable row level security;

alter table public.project_members
enable row level security;

alter table public.records
enable row level security;

alter table public.project_counters
enable row level security;

create policy "profile self read"
on public.profiles
for select
using (
  id = auth.uid()
  or
  exists (
    select 1
    from public.project_members pm1
    join public.project_members pm2
      on pm1.project_id = pm2.project_id
    where
      pm1.user_id = auth.uid()
      and pm2.user_id = profiles.id
  )
);

create policy "profile self update"
on public.profiles
for update
using (
  id = auth.uid()
);

create policy "members read projects"
on public.projects
for select
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = projects.id
      and m.user_id = auth.uid()
  )
);

create policy "users create projects"
on public.projects
for insert
with check (
  created_by = auth.uid()
);

create policy "owners update projects"
on public.projects
for update
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = projects.id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin'
      )
  )
);

create policy "members read memberships"
on public.project_members
for select
using (
  user_id = auth.uid()
  or
  exists (
    select 1
    from public.project_members m
    where
      m.project_id =
        project_members.project_id
      and m.user_id = auth.uid()
  )
);

create policy "creator adds ownership"
on public.project_members
for insert
with check (
  (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.projects p
      where
        p.id = project_id
        and p.created_by = auth.uid()
    )
  )
  or
  exists (
    select 1
    from public.project_members m
    where
      m.project_id =
        project_members.project_id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin'
      )
  )
);

create policy "admins update memberships"
on public.project_members
for update
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id =
        project_members.project_id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin'
      )
  )
);

create policy "members read records"
on public.records
for select
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = records.project_id
      and m.user_id = auth.uid()
  )
);

create policy "managers create records"
on public.records
for insert
with check (
  created_by = auth.uid()
  and
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = records.project_id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin',
        'manager'
      )
  )
);

create policy "reviewers update records"
on public.records
for update
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = records.project_id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin',
        'manager',
        'reviewer'
      )
  )
);

create policy "admins delete records"
on public.records
for delete
using (
  exists (
    select 1
    from public.project_members m
    where
      m.project_id = records.project_id
      and m.user_id = auth.uid()
      and m.role in (
        'owner',
        'admin'
      )
  )
);