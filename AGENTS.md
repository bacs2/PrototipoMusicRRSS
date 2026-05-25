# RateRecord — AGENTS.md

Music social network MVP (Letterboxd-for-music). Next.js 15 / React 19 / Supabase / Tailwind / Satori.

## Commands

```sh
npm run dev          # next dev
npm run build        # next build
npm run start        # next start
npm run lint         # next lint
npm run typecheck    # tsc --noEmit (not in scripts; run manually)
npm run seed:albums  # tsx scripts/seed-albums.ts — import MusicBrainz albums into Supabase
```

No test framework installed. No pre-commit hooks.

## Structure

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages: `/feed`, `/item/[type]/[id]`, `/profile/[username]`, `/library`, `/collection/[username]/[id]`, `/collection/[username]/[id]/edit` |
| `app/api/share/[reviewId]/route.ts` | Satori OG image endpoint (reads `public/SpaceGrotesk-Regular.ttf`) |
| `components/` | Shared UI: AppShell, TopNav, ReviewCard, StatCard, SectionHeader, EmptyState, CreateCollectionModal, CreateCollectionButton |
| `lib/` | Supabase client/server wrappers, env helper, theme provider, date formatter |
| `lib/actions/` | Server Actions: `collections.ts` (create, update, delete, update annotation) |
| `services/` | DB queries (`queries.ts`), MusicBrainz integration (`musicbrainz.ts`), share-image catalog lookup |
| `scripts/` | Admin CLI: `seed-albums.ts` imports albums from MusicBrainz into Supabase via interactive prompts |
| `supabase/schema.sql` | Full schema + RLS policies (Spanish-named tables — NOT English) |
| `types/models.ts` | Shared TS types; `ItemType = "artista" \| "album" \| "cancion"` |
| `styles/globals.css` | Global CSS + CSS custom properties for dark/light theme |
| `stitch_sound_box/` | Design reference exports (not used at runtime) |
| `DESIGN.md` | Full visual spec: colors, typography, radii, component templates |

## Conventions to know

- **Spanish data model**: Tables use Spanish names (`Datos_usuario`, `Resenas_de_usuario`, `Albumes`, `Canciones`, `Artistas`, `Coleccion_o_Lista`, `Biblioteca_usuario`, `Historial_de_reproduccion`, `Wishlist`, `Perfiles_similares`). Item types are `"artista"`, `"album"`, `"cancion"`. All DB queries must use these names.
- **Path alias**: `@/*` maps to project root. Some files use `@/`, others use relative `../../` — either is fine.
- **Theme**: Dark/light via `.dark` class on `<html>`. Tailwind `darkMode: "class"`. `ThemeProvider` (`lib/theme-provider.tsx`) manages localStorage + class toggle.
- **Fonts**: Epilogue (headlines, `font-headline`), Manrope (body, `font-body`, `label-md`). Loaded from Google Fonts in `globals.css`.
- **Design tokens**: CSS custom properties in `globals.css`, mapped to Tailwind colors in `tailwind.config.ts`. No raw hex values — use `bg-primary`, `text-on-surface-variant`, etc.
- **Supabase RLS**: Public tables have permissive select policies. User-owned tables restrict by `auth.uid()`. `Coleccion_o_Lista` has both a public select policy (for viewing) and an owner-only policy (for edit/delete). Auth not fully wired yet — uses `DEMO_USER_ID` env var for queries.
- **Env required**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DEMO_USER_ID` (a UUID). Copy `.env.example` → `.env`.
- **OG images**: Endpoint at `/api/share/[reviewId]` returns SVG via `satori`. Needs `public/SpaceGrotesk-Regular.ttf` font file.
- **MusicBrainz**: Rate-limited public API. All requests require a `User-Agent` header. Defined in `services/musicbrainz.ts`.
- **Collection items JSONB**: `Coleccion_o_Lista.items` stores an array of `{ item_type: "artista"|"album"|"cancion", item_id: uuid, annotation?: text, must_listen?: text }`. Legacy format `{ album_id, annotation?, must_listen? }` is still accepted. Creating/editing collections uses `lib/actions/collections.ts` server actions.
- **Seed script**: `scripts/seed-albums.ts` uses `tsx` to run. Two modes:
  - **Album mode** (default): searches MusicBrainz for albums, prompts admin to pick which to import, then inserts Artist → Album → Tracks into Supabase. Supports `album|artist` syntax for precise Lucene AND search (e.g. `"Motomami|Rosalía"`) and `--limit N` flag.
  - **Artist mode** (`--artist "Nombre"`): searches for an artist, lists their albums, and on confirmation imports all of them. Resolves the artist once (saves API calls). Default limit is 20 albums.
  - Requires `SUPABASE_SERVICE_ROLE_KEY` env var to bypass RLS for inserts (or add INSERT policies to Artistas/Albumes/Canciones tables).
  - Track order preserved via `posicion` column in `Canciones`. Get tracks for an album via `getAlbumTracks(albumId)` in `services/queries.ts`.
- **Strict mode**: `tsconfig.json` has `strict: true`, `allowJs: false`. Fix type errors before building.

## Gotchas

- `lib/env.ts` throws on missing env vars at runtime — wrap calls or provide fallbacks in tests.
- Satori requires fonts loaded synchronously from disk (no `fetch`). Font file path is hardcoded to `public/SpaceGrotesk-Regular.ttf`.
- No auth UI yet — all pages pass `DEMO_USER_ID` directly. Adding real auth means wiring Supabase Auth + session to queries.
- Review `rating` column uses `numeric(3,1)` in Postgres (0–10 scale with 1 decimal).
