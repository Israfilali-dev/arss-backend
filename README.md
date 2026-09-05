# ARSS Entertainment — Backend API

Node.js + Express + PostgreSQL (Sequelize) + Cloudinary backend for the ARSS
Entertainment website and its admin panel.

## What this replaces

The old `Script.js` stored everything in the browser's `localStorage` and
checked the admin password (`Raunak@8100`) as plain text inside the JS file
— visible to anyone who opens devtools. This backend replaces that with:
- Real PostgreSQL storage, shared across every visitor and device
- Hashed passwords (bcrypt) and a signed JWT in an httpOnly cookie for
  admin sessions — the frontend never sees or stores the password/token in
  a readable place
- Cloudinary for every image, with only the resulting URL kept in Postgres

## 1. Local setup

```bash
cd arss-backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — a PostgreSQL connection string. For local development
  you can run Postgres in Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`
  then use `postgres://postgres:postgres@localhost:5432/arss_entertainment`
  (create the `arss_entertainment` database first).
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` —
  from your Cloudinary dashboard (free tier is enough to start).
- `JWT_SECRET` — any long random string, e.g. generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — the login you'll use for
  the admin panel. Pick a real password before seeding.

Then:

```bash
npm run seed   # creates the admin user + pre-fills content from the current site
npm run dev    # starts the API on http://localhost:5000 with auto-reload
```

Visit `http://localhost:5000/health` — you should see `{"status":"ok"}`.

## 2. Deploying (Render, Railway, or similar)

1. Push this `arss-backend` folder to a GitHub repo (or a subfolder of your
   existing project repo).
2. Create a **PostgreSQL** database on your host, or a free one on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com) — copy its
   connection string into `DATABASE_URL`.
3. Create a **Web Service** on Render/Railway pointing at this folder:
   - Build command: `npm install`
   - Start command: `npm start`
   - Add all the same environment variables from `.env` in the host's
     dashboard (never commit `.env` — it's already in `.gitignore`).
   - Set `CLIENT_ORIGIN` to your deployed frontend's URL (no trailing
     slash), so the browser is allowed to send the admin cookie.
   - Set `NODE_ENV=production`.
4. Once it's live, run the seed once — most hosts let you open a one-off
   shell (`npm run seed`), or you can temporarily set the start command to
   `npm run seed && npm start` for the first deploy only.

## 3. API overview

All routes are under `/api`. Public (no login) endpoints are the `GET`
routes for site content plus `POST /api/enquiries` (the contact form).
Everything else requires an admin session (cookie set by
`POST /api/auth/login`).

| Section | Public read | Admin write |
|---|---|---|
| Hero | `GET /api/hero` | `PUT /api/hero`, `POST/DELETE /api/hero/images` |
| About | `GET /api/about` | `PUT /api/about` |
| Films | `GET /api/films` | `POST/PUT/DELETE /api/films/:id`, `GET /api/films/admin` (all statuses) |
| Team | `GET /api/team` | `POST/PUT/DELETE /api/team/:id` |
| Gallery | `GET /api/gallery` | `POST/PUT/DELETE /api/gallery/:id` |
| Testimonials | `GET /api/testimonials` | `POST/PUT/DELETE /api/testimonials/:id` |
| Services | `GET /api/services` | `POST/PUT/DELETE /api/services/:id` |
| Footer | `GET /api/footer` | `PUT /api/footer` |
| Settings (logo/social) | `GET /api/settings` | `PUT /api/settings`, `POST /api/settings/logo` |
| Enquiries | — | `GET/PUT/DELETE /api/enquiries...` |
| Auth | — | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |

Image uploads (films, team photos, gallery, testimonials, hero images, the
logo) are `multipart/form-data` — send the file under the field name shown
in each route file (e.g. `poster` for films, `photo` for team/testimonials,
`image` for hero/gallery, `logo` for the site logo).

## 4. Next step

This API is ready to be called — the frontend (`index.html`) and admin
panel (`Admin.html`) still need their JS rewritten to fetch from it instead
of `localStorage`. That's the next piece of this project.
