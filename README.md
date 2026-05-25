# RateRecord

MVP de red social musical tipo "Letterboxd para música".

Next.js 15 · React 19 · Supabase · Tailwind CSS · Satori

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React
- **Backend**: Supabase (PostgreSQL + RLS)
- **OG Images**: Satori
- **Datos musicales**: MusicBrainz API + Cover Art Archive

## Setup

```bash
cp .env.example .env
# Completar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, DEMO_USER_ID
npm install
```

### Base de datos

Las tablas están definidas en `supabase/schema.sql`. Para aplicarlas:

```bash
npm run apply-schema
# o manualmente: copia el contenido de supabase/schema.sql en Supabase Dashboard → SQL Editor
```

## Comandos

```bash
npm run dev            # Servidor de desarrollo (next dev)
npm run build          # Build de producción
npm run start          # Iniciar servidor de producción
npm run lint           # Linter (next lint)
npm run seed:albums    # Importar álbumes desde MusicBrainz a Supabase
npm run apply-schema   # Aplicar schema.sql a la base de datos
```

Para typecheck manual: `npx tsc --noEmit`

## Importar álbumes (seed)

El script `seed:albums` busca álbumes en MusicBrainz y los guarda en las tablas `Artistas`, `Albumes` y `Canciones`.

```bash
# Buscar por álbum + artista (recomendado)
npm run seed:albums "Motomami|Rosalía" "Random Access Memories|Daft Punk"
# Busqueda libre solo por nombre
npm run seed:albums "Thriller"
# Aumentar resultados mostrados
npm run seed:albums -- --limit 15 "Thriller|Michael Jackson"
```

**Flujo:**
1. Busca el álbum en MusicBrainz (usando Lucene AND si se especifica artista)
2. Muestra resultados y permite seleccionar cuál importar
3. Obtiene detalles del álbum, artista, tracks y portada
4. Guarda todo en Supabase (evita duplicados por MBID)

**Requisito**: Agregar `SUPABASE_SERVICE_ROLE_KEY` al `.env` (desde Supabase Dashboard → Settings → API → service_role key) para poder insertar datos con RLS activo.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/feed` | Muro con actividad de seguidos |
| `/item/album/[id]` | Detalle de álbum con tracklist y reseñas |
| `/item/artista/[id]` | Detalle de artista |
| `/item/cancion/[id]` | Detalle de canción |
| `/profile/[username]` | Perfil de usuario |
| `/library` | Biblioteca personal |

## Diseño

Ver `DESIGN.md` para la especificación visual completa (colores, tipografía, componentes).

## Base de datos

El schema está en `supabase/schema.sql`. Los nombres de tablas están en español (`Artistas`, `Albumes`, `Canciones`, `Resenas_de_usuario`, etc.). La autenticación usa Supabase Auth con RLS.
