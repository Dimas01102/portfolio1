# Portfolio — React + Supabase

A rebuild of your portfolio as a React + TypeScript app, backed by Supabase.
Everything on the home page (photo, about text, skills, featured skills,
certificates) plus a full blog is editable from a password-protected
`/admin` panel — no more hand-editing HTML.

## What's inside

- **Public site**: Hero, About, Skills (with a featured row), a live GitHub
  contribution graph, Certificates, Contact, and a Blog with individual post
  pages.
- **Admin panel** (`/admin`): sign in with a Supabase Auth account, then
  manage your profile photo, about text, skills (CRUD + featured toggle),
  certificates (CRUD + image upload), and blog posts (CRUD + cover image +
  publish toggle).
- **Theme**: a new "professional" palette — deep navy background, a single
  indigo accent for actions, a warm brass accent for highlights — with a
  light/dark toggle carried over from the original site.
- **Boot animation**: a terminal-style loading sequence (like your original
  `loadingScreen`), rebuilt as a React component, plays once per browser
  session.
- **GitHub stats**: pulls your real contribution calendar and public repo
  count directly from GitHub, styled to match the contribution graph you
  screenshotted.

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
5. **Blog** — write posts, toggle "Published" when ready to go live.

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
