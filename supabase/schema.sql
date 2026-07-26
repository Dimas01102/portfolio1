-- ============================================================
-- PORTFOLIO DATABASE SCHEMA
-- Run this whole file once in Supabase SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1. PROFILE (single row: hero photo, name, role, about text)
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Your Name',
  role_titles text[] not null default array['Fullstack Developer'], -- rotates in typing effect
  about text not null default 'Write something about yourself.',
  photo_url text,
  resume_url text,
  github_username text not null default '',
  email text,
  location text,
  updated_at timestamptz not null default now()
);

-- 2. SKILLS (also used for "Featured Skills" via is_featured flag)
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'bi-code-slash', -- bootstrap-icons class
  category text not null default 'Other',      -- e.g. Frontend / Backend / Tools
  level int not null default 80 check (level between 0 and 100),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. CERTIFICATES
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date date,
  image_url text,
  credential_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. PROJECTS (public "Projects" page)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  tech_stack text[] not null default '{}',
  live_url text,
  repo_url text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 5. BLOG POSTS
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can READ. Only authenticated (admin) users can WRITE.
-- ============================================================
alter table profile enable row level security;
alter table skills enable row level security;
alter table certificates enable row level security;
alter table projects enable row level security;
alter table blog_posts enable row level security;

-- Public read
create policy "public read profile" on profile for select using (true);
create policy "public read skills" on skills for select using (true);
create policy "public read certificates" on certificates for select using (true);
create policy "public read projects" on projects for select using (true);
create policy "public read published posts" on blog_posts for select
  using (is_published = true or auth.role() = 'authenticated');

-- Authenticated (admin) write access
create policy "auth write profile" on profile for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write skills" on skills for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write certificates" on certificates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write projects" on projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write posts" on blog_posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed one profile row so the app always has something to read
insert into profile (full_name, role_titles, about, github_username)
select 'Dimas Dwi Prasetiyo', array['Fullstack Developer','React & Laravel Engineer'],
  'Software engineering student building polished, production-ready web apps.', 'your-github-username'
where not exists (select 1 from profile);

-- Seed a starter set of skills so the Skills section isn't empty on first run.
-- Feel free to edit or delete every one of these from /admin/skills.
insert into skills (name, icon, category, is_featured, sort_order)
select * from (values
  ('React', 'bi-code-square', 'Frontend', true, 1),
  ('Laravel', 'bi-code-slash', 'Backend', true, 2),
  ('TypeScript', 'bi-filetype-tsx', 'Frontend', true, 3),
  ('Supabase', 'bi-database', 'Backend', true, 4),
  ('Tailwind CSS', 'bi-palette', 'Frontend', false, 5),
  ('PHP', 'bi-filetype-php', 'Backend', false, 6),
  ('MySQL', 'bi-server', 'Backend', false, 7),
  ('PostgreSQL', 'bi-database-fill', 'Backend', false, 8),
  ('Git & GitHub', 'bi-git', 'Tools', false, 9),
  ('Figma', 'bi-vector-pen', 'Tools', false, 10),
  ('Docker', 'bi-box-seam', 'Tools', false, 11),
  ('Vite', 'bi-lightning-charge', 'Tools', false, 12)
) as v(name, icon, category, is_featured, sort_order)
where not exists (select 1 from skills);

-- ============================================================
-- STORAGE
-- Create a public bucket called "portfolio" for photos, certificate
-- images and blog covers. Run this in the SQL editor too.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "public read portfolio bucket" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "auth upload portfolio bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');
create policy "auth update portfolio bucket" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');
create policy "auth delete portfolio bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');
