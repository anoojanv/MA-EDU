-- Each signed-in grown-up is a family. Children belong to a family.
create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  birth_date date not null check (birth_date > date '2005-01-01'),
  avatar text not null default '⭐' check (char_length(avatar) <= 16),
  theme text not null default 'diamond' check (theme in ('diamond', 'garden', 'space')),
  tone text not null default 'blue' check (tone in ('blue', 'red', 'green', 'clay', 'yellow')),
  level_override text check (level_override in ('prek', 'jk', 'sk', 'g1', 'g2', 'g3')),
  stars integer not null default 0 check (stars >= 0),
  progress jsonb not null default '{}'::jsonb,
  plan_state jsonb not null default '{}'::jsonb,
  free_level text check (free_level in ('prek', 'jk', 'sk', 'g1', 'g2', 'g3')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index children_family_id_idx on public.children (family_id);

-- One row per answered question, for the grown-ups' progress view.
create table public.answers (
  id bigint generated always as identity primary key,
  child_id uuid not null references public.children (id) on delete cascade,
  family_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id text not null check (char_length(skill_id) <= 40),
  correct boolean not null,
  score_after integer not null check (score_after between 0 and 100),
  created_at timestamptz not null default now()
);

create index answers_child_created_idx on public.answers (child_id, created_at desc);
create index answers_family_id_idx on public.answers (family_id);

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger children_touch before update on public.children
for each row execute function public.touch_updated_at();

alter table public.children enable row level security;
alter table public.answers enable row level security;

create policy "Families read their children" on public.children
  for select to authenticated using (family_id = (select auth.uid()));
create policy "Families add children" on public.children
  for insert to authenticated with check (family_id = (select auth.uid()));
create policy "Families update their children" on public.children
  for update to authenticated using (family_id = (select auth.uid())) with check (family_id = (select auth.uid()));
create policy "Families remove their children" on public.children
  for delete to authenticated using (family_id = (select auth.uid()));

create policy "Families read their answers" on public.answers
  for select to authenticated using (family_id = (select auth.uid()));
create policy "Families record answers for their children" on public.answers
  for insert to authenticated with check (
    family_id = (select auth.uid())
    and exists (select 1 from public.children c where c.id = child_id and c.family_id = (select auth.uid()))
  );

revoke all on public.children, public.answers from anon;
