-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  threads_connected boolean default false,
  threads_user_id text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  pin_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drafts
create table public.drafts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Thread',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed', 'archived')),
  tags text[] default '{}',
  version integer default 1,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Thread blocks
create table public.thread_blocks (
  id uuid default uuid_generate_v4() primary key,
  draft_id uuid references public.drafts(id) on delete cascade not null,
  content text not null default '',
  "order" integer not null default 0,
  media_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Draft versions (for version history)
create table public.draft_versions (
  id uuid default uuid_generate_v4() primary key,
  draft_id uuid references public.drafts(id) on delete cascade not null,
  blocks jsonb not null,
  version integer not null,
  created_at timestamptz default now()
);

-- Templates
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text not null default 'custom' check (category in ('hook', 'cta', 'storytelling', 'custom')),
  content text not null,
  created_at timestamptz default now()
);

-- Idea inbox
create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Scheduled posts
create table public.scheduled_posts (
  id uuid default uuid_generate_v4() primary key,
  draft_id uuid references public.drafts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'publishing', 'published', 'failed')),
  error text,
  threads_post_ids text[] default '{}',
  created_at timestamptz default now()
);

-- Activity logs
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  metadata jsonb default '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Analytics
create table public.analytics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  posts_created integer default 0,
  posts_published integer default 0,
  total_chars integer default 0,
  unique (user_id, date)
);

-- Indexes
create index idx_drafts_user_id on public.drafts(user_id);
create index idx_drafts_status on public.drafts(status);
create index idx_drafts_updated_at on public.drafts(updated_at desc);
create index idx_thread_blocks_draft_id on public.thread_blocks(draft_id);
create index idx_thread_blocks_order on public.thread_blocks(draft_id, "order");
create index idx_draft_versions_draft_id on public.draft_versions(draft_id);
create index idx_scheduled_posts_status on public.scheduled_posts(status);
create index idx_activity_logs_user_id on public.activity_logs(user_id);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.drafts enable row level security;
alter table public.thread_blocks enable row level security;
alter table public.draft_versions enable row level security;
alter table public.templates enable row level security;
alter table public.ideas enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.activity_logs enable row level security;
alter table public.analytics enable row level security;

-- Profiles: users can only access their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Drafts: users can only access their own
create policy "Users can CRUD own drafts" on public.drafts for all using (auth.uid() = user_id);

-- Thread blocks: via draft ownership
create policy "Users can CRUD own thread blocks" on public.thread_blocks for all using (
  exists (select 1 from public.drafts where drafts.id = thread_blocks.draft_id and drafts.user_id = auth.uid())
);

-- Draft versions
create policy "Users can CRUD own versions" on public.draft_versions for all using (
  exists (select 1 from public.drafts where drafts.id = draft_versions.draft_id and drafts.user_id = auth.uid())
);

-- Templates
create policy "Users can CRUD own templates" on public.templates for all using (auth.uid() = user_id);

-- Ideas
create policy "Users can CRUD own ideas" on public.ideas for all using (auth.uid() = user_id);

-- Scheduled posts
create policy "Users can CRUD own scheduled posts" on public.scheduled_posts for all using (auth.uid() = user_id);

-- Activity logs
create policy "Users can view own logs" on public.activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.activity_logs for insert with check (auth.uid() = user_id);

-- Analytics
create policy "Users can CRUD own analytics" on public.analytics for all using (auth.uid() = user_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_drafts_updated_at before update on public.drafts
  for each row execute procedure public.update_updated_at();
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
