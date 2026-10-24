# RealtorX website and dashboards

The public website (www.realtorxglobal.com) and the Agent (`/agent/`) and Developer (`/developer/`) dashboards. React + Vite +
Tailwind. All data comes from the RealtorX ERPNext backend (private repository) through `/api/erp`, as the visitor's own
session; no API keys are used.

## Run locally

Needs Node.js and a running ERPNext site with the `realtor_x` app (`bench start`, port 8000).

1. `npm install`
2. Copy `.env.example` to `.env.local` (defaults work for a local bench).
3. `npm run dev`, then open http://localhost:3000 (dashboards: `/agent/`, `/developer/`).

`npm run typecheck` checks the code; `npm run build` makes the production files in `dist/`.

## Deploy (Vercel)

- Set `ERPNEXT_URL` to the public backend address (see `.env.example`). `middleware.ts` rewrites `/api/erp/*`, `/files/*`
  and `/private/files/*` there; `vercel.json` sends every page to the single-page app.
- Optional: `RX_EDGE_KEY` (same value in the backend gate) for trusted visitor IPs, and `VITE_ERP_DESK_URL` for a staff link.
