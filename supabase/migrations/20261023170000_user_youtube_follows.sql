create table if not exists public.user_youtube_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_key text not null,
  channel_input text not null,
  channel_id text,
  channel_title text,
  channel_thumbnail text,
  last_live_video_ids text[] not null default '{}',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_youtube_follows_user_channel_unique unique (user_id, channel_key)
);

create index if not exists user_youtube_follows_user_id_idx
  on public.user_youtube_follows (user_id, created_at desc);

alter table public.user_youtube_follows enable row level security;

drop policy if exists "Users can read their own YouTube follows" on public.user_youtube_follows;
create policy "Users can read their own YouTube follows"
  on public.user_youtube_follows for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own YouTube follows" on public.user_youtube_follows;
create policy "Users can add their own YouTube follows"
  on public.user_youtube_follows for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own YouTube follows" on public.user_youtube_follows;
create policy "Users can update their own YouTube follows"
  on public.user_youtube_follows for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own YouTube follows" on public.user_youtube_follows;
create policy "Users can remove their own YouTube follows"
  on public.user_youtube_follows for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.user_youtube_follows from anon;
grant select, insert, update, delete on public.user_youtube_follows to authenticated;