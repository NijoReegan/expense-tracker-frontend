# Smart Expense Tracker — Frontend (ET-frontend)

React 19 + Vite single-page app for the personal expense tracker.
Talks to the Spring Boot backend in `et-server` (sibling folder).

## Stack

- React 19, React Router, Vite
- Tailwind CSS
- chart.js for analytics charts

## Run

Backend first (see `../et-server/README.md`), then:

```powershell
npm.cmd install
npm.cmd run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies API requests
(`/auth`, `/users`, `/expenses`, `/incomes`, `/goals`, `/budgets`,
`/notifications`) to `http://localhost:8080`.

To point the API at another origin (e.g. a deployed backend), set
`VITE_API_BASE_URL` in `.env` (copy `.env.example`):

```
VITE_API_BASE_URL=https://api.example.com
```

## Build

```powershell
npm.cmd run build
```

## Deploy to Vercel

Import the repository on Vercel and set:

| Setting           | Value            |
| ----------------- | ---------------- |
| Root Directory    | `ET-frontend`    |
| Framework Preset  | Vite             |
| Build Command     | `npm run build`  |
| Output Directory  | `dist`           |

`vercel.json` in this folder pins the preset, output directory, an SPA rewrite
so client-side routes like `/expenses` survive a hard refresh, and immutable
caching for hashed assets under `/assets`.

Then add this environment variable (Vercel → Settings → Environment Variables):

```
VITE_API_BASE_URL=https://et-server.onrender.com
```

Notes:

- `VITE_API_BASE_URL` is inlined at **build time**. Changing it requires a
  redeploy, not just a restart.
- It is a **cross-origin** call in production (the Vite dev proxy only exists in
  `npm run dev`), so the backend must list the Vercel origin in `FRONTEND_URL`.
- Leave the variable unset and every request goes to the Vercel origin itself,
  which returns HTML/404 instead of JSON.
- To let preview deployments talk to the backend, set `ALLOW_VERCEL_PREVIEWS=true`
  on the Render service.

## How the frontend talks to the backend

- `src/api/client.js` is a small `fetch`-based client. Every call returns
  `{ data }`, and the JWT is attached automatically from localStorage.
  On a `401` it clears the session and dispatches `et:unauthorized`
  (listened to by `AuthContext`).
- `src/context/AuthContext.jsx` stores the JWT + user returned by
  `/auth/register` and `/auth/login`.
- `src/context/AppDataContext.jsx` loads the user profile, expenses, incomes,
  goals, budgets and notifications, and exposes CRUD actions. The dashboard and
  analytics are computed client-side from this data.

## Pages

`/` landing, `/login`, `/register`, `/dashboard`, `/expenses`, `/income`,
`/savings`, `/budget`, `/analytics`, `/settings`.