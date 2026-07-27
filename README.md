# Portfolio — React + Supabase

A rebuild of your portfolio as a React + TypeScript app, backed by Supabase.
Everything on the home page (photo, about text, skills, featured skills,
certificates) plus a full blog is editable from a password-protected
`/admin` panel — no more hand-editing HTML.

## What's inside

- **Public site**: Hero with animated flowing lines + glowing photo ring, an
  infinite crossed-ribbon marquee of your tech stack, About, Skills (icon
  grid, no progress bars), a live GitHub contribution graph with a little
  snake that crawls across it, Certificates (compact cards with a
  click-to-enlarge lightbox), a full **Projects** showcase page, Contact
  (with a floating left-side social dock), and a Blog with individual post
  pages.
- **Admin panel** (`/admin`): sign in with a Supabase Auth account, then
  manage your profile photo, about text, skills (CRUD), certificates (CRUD +
  image upload), projects (CRUD + image upload), and blog posts (CRUD +
  cover image + publish toggle). There's no visible "Admin" link anywhere on
  the public site on purpose — just go to `/admin/login` directly.
- **Motion & feel**: every card has a soft cursor-following glow, sections
  fade/slide in as you scroll, the navbar is a floating glass pill, mobile
  uses a bottom tab bar instead of a hamburger menu, and the first load
  shows skeleton placeholders instead of a blank page. Everything respects
  `prefers-reduced-motion`.
- **Theme**: a "professional" palette — deep navy background, a single
  indigo accent for actions, a warm brass accent for highlights — with a
  light/dark toggle.
- **Boot animation**: a terminal-style loading sequence, plays once per
  browser session.
- **GitHub stats**: pulls your real contribution calendar and public repo
  count directly from GitHub, no token needed.


## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free
   tier is enough).
2. Open **SQL Editor** → **New query**, paste the entire contents of
   `supabase/schema.sql`, and click **Run**. This creates all four tables
   (`profile`, `skills`, `certificates`, `blog_posts`), sets up row-level
   security (public can read, only signed-in admins can write), and creates
   a public storage bucket called `portfolio` for your images.
3. Go to **Authentication → Users → Add user** and create yourself an admin
   login (email + password). This is the account you'll use to sign in at
   `/admin/login` — there's no public sign-up form on purpose.

## 2. Configure the app

```bash
cp .env.example .env
```

Open `.env` and fill in your project's URL and anon key, both found under
**Project Settings → API** in Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. The public site will show placeholder/seed
content until you fill things in from the admin panel.

## 4. Fill in your content

1. Go to `http://localhost:5173/admin/login` and sign in with the user you
   created in step 1.
2. **Profile & photo** — upload your photo, set your name, rotating role
   titles, about text, email, location, and **your GitHub username** (this
   powers the contribution graph — the site pulls real data live from
   GitHub, no API key needed).
3. **Skills** — add each skill, pick a category, and toggle "Featured" for
   the ones you want to show in the highlighted row.
4. **Certificates** — add title, issuer, date, and upload the certificate
   image.
5. **Projects** — add each project with a screenshot, tech stack tags, and
   live/repo links. Toggle "Featured" to badge it.
6. **Blog** — write posts, toggle "Published" when ready to go live.
7. **Social links** — the left-side social dock and footer currently point
   to placeholder URLs (`github.com/`, `linkedin.com/`, `wa.me/`,
   `instagram.com/`, `mailto:hello@example.com`). Open
   `src/components/SocialDock.tsx` and `src/components/Footer.tsx` and swap
   in your real profile links — these aren't in the database since they
   rarely change.

A handful of common skills (React, Laravel, TypeScript, Supabase, etc.) are
pre-seeded by `schema.sql` so the Skills section isn't empty on first run —
edit or delete them from `/admin/skills` as you like.

Original images from your old site are copied into `seed-assets/` in this
project (profile photo, project screenshots) if you want to re-upload any of
them through the admin panel.

## 5. Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
```

Deploy the `dist/` folder, and set the same two `VITE_SUPABASE_*` environment
variables in your host's dashboard (not just locally in `.env`).

**Important — client-side routing:** this is a single-page app, so a direct
visit to a URL like `/admin/login` or `/projects` (typing it in the address
bar, or reloading the page while on it) needs the host to serve `index.html`
for every path, not just `/`. Without this, those URLs 404 in production even
though they work fine at `localhost:5173` in dev (Vite's dev server already
does this automatically, which is why it's easy to miss until you deploy).
This repo already includes the fix for the two most common hosts:
- **Vercel** — `vercel.json` (rewrites everything to `index.html`)
- **Netlify / Cloudflare Pages** — `public/_redirects`

If you're deploying somewhere else (GitHub Pages, a plain Nginx/Apache
server, etc.), you'll need the equivalent — for Nginx that's
`try_files $uri /index.html;`, for Apache an `.htaccess` rewrite rule.

## Notes

- The admin panel is protected by Supabase Auth + row-level security, so
  even if someone finds `/admin`, they can't write to the database without
  signing in with your account.
- There's no public "sign up" — only accounts you create manually in the
  Supabase dashboard can log in.
- The GitHub contribution graph uses a free, keyless public API
  (`github-contributions-api.jogruber.de`), which mirrors what GitHub shows
  on your profile. If it's ever down, the section just hides itself instead
  of showing broken data.