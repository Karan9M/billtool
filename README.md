# BillTool — GST Invoicing PWA

A single-user, production-ready Next.js 16 PWA for generating GST-compliant tax invoices. Built for **SAI Communication System** (CCTV & Security Systems, Ahmedabad), but the company info lives in a settings table, so the same app works for any small Indian business.

- Live `@react-pdf/renderer` invoice preview while you fill the form
- Indian-system number-to-words ("ONE THOUSAND SEVEN HUNDRED SEVENTY RUPEES ONLY")
- CGST + SGST (intra-state) and IGST (inter-state) tax modes
- Quick-fill presets for common CCTV items with HSN codes
- Atomic invoice numbering via Postgres function (no race on concurrent saves)
- Logo & signature upload to Supabase Storage
- Installable PWA with shortcut to "New Invoice"

---

## 1. Local development

Prerequisites: **Node.js 20.9+**, **bun** (or npm/pnpm), and a free Supabase project.

```bash
bun install
cp .env.local.example .env.local      # then fill in your Supabase URL + anon key
bun run dev
```

Open <http://localhost:3000>.

> If you prefer npm: `npm install && npm run dev`.

---

## 2. Supabase setup

1. Create a new project at <https://supabase.com>.
2. Go to **SQL Editor** → **New query** → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   This creates two tables (`company_settings`, `invoices`), the `increment_invoice_number()` RPC, the `company-assets` storage bucket, and seeds the SAI Communication System company row.
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon`/`public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Paste both into your `.env.local`.

The schema is **idempotent** — safe to re-run if you change something. RLS is intentionally **disabled** since this is a single-user app.

---

## 3. Adding logo & signature

1. Visit <http://localhost:3000/settings>.
2. Open the **Branding** tab.
3. Upload a square PNG/JPG for the logo (it appears top-left of the invoice header).
4. Upload a transparent-background PNG (~400×150 px) for the signature (it appears above "Authorised Signatory" on the invoice).

Both files go to the public `company-assets` Supabase Storage bucket. Their public URLs are saved on the `company_settings` row and rendered into the PDF.

To replace later, just upload again — the Branding tab uses upsert.

---

## 4. Replacing the app icon

The PWA ships with a navy "S" SVG icon at [`public/icon.svg`](public/icon.svg). For best Android install support, replace it with raster PNGs:

1. Generate `icon-192.png` (192×192) and `icon-512.png` (512×512) — try <https://realfavicongenerator.net> with any source square logo.
2. Drop them in `public/`.
3. Edit [`app/manifest.ts`](app/manifest.ts) to point at the PNGs:
   ```ts
   icons: [
     { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
     { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
   ],
   ```

---

## 5. Production build

```bash
bun run build
bun run start          # serves the production build on port 3000
```

Next.js 16 uses **Turbopack** by default for both `dev` and `build`. The
`turbopack.resolveAlias` block in [`next.config.ts`](next.config.ts) stubs out
the Node-only `canvas` and `encoding` modules referenced by
`@react-pdf/renderer`'s upstream `pdfkit` — without that the build will fail.

---

## 6. Deploy to Vercel

```bash
bunx vercel --prod
```

In the Vercel dashboard:

1. **Project → Settings → Environment Variables** — add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview).
2. Redeploy. That's it.

> **PWA install prompt** requires HTTPS. It works on Vercel automatically; on `localhost` use Chrome DevTools → Application → Manifest to verify the manifest.

---

## 7. Project layout

```
app/
  page.tsx                 → Dashboard
  invoices/
    page.tsx               → All invoices list
    new/page.tsx           → New invoice (split: form + live preview)
    [id]/page.tsx          → Invoice detail (split: meta + PDF)
  settings/page.tsx        → 4-tab settings (Company / Bank / Invoice / Branding)
  api/invoices/
    route.ts               → POST: create invoice (atomic numbering)
    [id]/route.ts          → PATCH status, DELETE
  manifest.ts              → PWA manifest (Next 16 native)
  icon.tsx                 → Dynamic favicon
components/
  layout/                  → Sidebar + AppShell
  invoice-pdf/             → @react-pdf/renderer template + dynamic wrappers
  invoice-form/            → react-hook-form tabs (Buyer/Items/Tax/Notes)
  invoice-detail/          → Detail screen
  invoices-list/           → Listing with search + status filter
  dashboard/               → Stat cards + recent invoices
  settings/                → 4 settings tabs
lib/
  supabase/{client,server} → Lazy clients (throw helpful error if env missing)
  invoice-utils.ts         → numberToWords, calculateTotals, formatCurrency, etc.
  quick-fill-items.ts      → CCTV item presets + HSN code hints
  validators.ts            → zod schemas
types/invoice.ts           → All TypeScript types
supabase/schema.sql        → Tables + RPC + seed + storage bucket policies
```

---

## 8. Verifying the PDF matches your existing format

The bundled sample (`GST-022-2025-2026`) is one of your existing manual invoices. After Supabase setup:

1. Go to `/invoices/new`.
2. The proposed number auto-fills as `GST-040-2025-2026` (seed `current_number=39`).
3. Fill in the buyer **VARUNEY MFG. INDUSTRIES**, address `B-15 AGRAWAL INDUSTRIAL ESTATE, MEHDIKUVA DUDHESHWAR ROAD, AHMEDABAD-380004`, GSTIN `24AFBS1720F1ZX`.
4. Add one item: description `CABLING FOR CCTV & CAMERA REPARING`, HSN `8544`, qty `1`, rate `1500`. (Quick Fill → "Cabling Work" gets you most of the way.)
5. Tax: CGST + SGST @ 18% (default).
6. The right-hand preview should show **TOTAL ₹1,770** with the words "ONE THOUSAND SEVEN HUNDRED SEVENTY RUPEES ONLY".
7. Click **Save** → you land on `/invoices/<uuid>`. Click **Download PDF**.

Concurrency check: open two `/invoices/new` tabs and submit them rapidly. They get sequential numbers (`040`, `041`) thanks to the `increment_invoice_number()` RPC.

---

## 9. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19.2) |
| Database | Supabase (Postgres + Storage) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (radix-nova style) |
| Forms | react-hook-form + zod |
| Animation | framer-motion |
| PDF | @react-pdf/renderer |
| PWA | Native Next.js manifest + theme-color |

No `next-pwa` plugin is used because it relies on Webpack and Next 16's default bundler is Turbopack.

---

## 10. Common gotchas

- **"Supabase env vars are missing"** in dev → check `.env.local` exists with both `NEXT_PUBLIC_*` keys, then restart `bun run dev`.
- **PDF preview blank in production** → most often caused by the `canvas`/`encoding` aliases not being applied. Verify the `turbopack.resolveAlias` block in [`next.config.ts`](next.config.ts).
- **`row not found` on insert** → the seed didn't run. Re-run [`supabase/schema.sql`](supabase/schema.sql) (it's idempotent).
- **Invoice numbers skipping** → if you submit a draft and then delete it, the counter doesn't decrement. This is intentional to preserve audit trail. To reset, edit `current_number` in **Settings → Invoice Config**.
