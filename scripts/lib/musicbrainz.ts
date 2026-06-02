const MB_API_BASE = "https://musicbrainz.org/ws/2";
const CAA_API_BASE = "https://coverartarchive.org";
const USER_AGENT = "RateRecord/0.1 (admin-import-script)";
const REQUEST_DELAY = 1500;
const MAX_RETRIES = 3;

let lastRequest = 0;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function rateLimitedFetch(url: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const now = Date.now();
    const elapsed = now - lastRequest;
    if (elapsed < REQUEST_DELAY) {
      await delay(REQUEST_DELAY - elapsed);
    }

    try {
      lastRequest = Date.now();
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });

      if (res.status === 429 && attempt < MAX_RETRIES - 1) {
        const retryAfter = res.headers.get("Retry-After");
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        console.log(`  ⏳ Rate limited. Reintentando en ${wait / 1000}s...`);
        await delay(wait);
        continue;
      }

      return res;
    } catch (err) {
      if (attempt < MAX_RETRIES - 1) {
        const wait = (attempt + 1) * 3000;
        console.log(`  ⏳ Error de red. Reintentando en ${wait / 1000}s...`);
        await delay(wait);
        continue;
      }
      throw new Error(`Error de conexión con MusicBrainz: ${(err as Error).message}`);
    }
  }

  throw new Error("Max retries alcanzado");
}

function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const parts = raw.split("-");
  if (parts.length === 1) return `${raw}-01-01`;
  if (parts.length === 2) return `${raw}-01`;
  return raw;
}

function getFirstDate(rg: {
  "first-release-date"?: string | null;
  releases?: { date?: string | null }[];
}): string | null {
  const raw = rg["first-release-date"] ?? rg.releases?.[0]?.date ?? null;
  return normalizeDate(raw);
}

function extractTags(entity: { tags?: { name: string }[] }): string[] {
  return (
    entity.tags
      ?.filter((t) => !t.name.startsWith("_"))
      .slice(0, 8)
      .map((t) => t.name) ?? []
  );
}

export async function searchReleaseGroups(
  albumQuery: string,
  artistQuery?: string,
  limit = 5
): Promise<
  { mbid: string; title: string; artist: string; year: string | null }[]
> {
  const luceneQuery = artistQuery
    ? `releasegroup:"${albumQuery}" AND artist:"${artistQuery}"`
    : albumQuery;
  const url = `${MB_API_BASE}/release-group/?query=${encodeURIComponent(luceneQuery)}&fmt=json&limit=${limit}`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB search error: ${res.status}`);
  const body = await res.json();
  const rgs = body["release-groups"] ?? [];
  return rgs.map((rg: Record<string, unknown>) => {
    const artistCredit = (rg["artist-credit"] as Record<string, unknown>[]) ?? [];
    const artistName = artistCredit
      .map((ac) => (ac.artist as Record<string, string>)?.name ?? ac.name ?? "")
      .join(", ");
    return {
      mbid: rg.id as string,
      title: rg.title as string,
      artist: artistName || "Unknown",
      year: getFirstDate(rg as Parameters<typeof getFirstDate>[0])?.slice(0, 4) ?? null,
    };
  });
}

export async function lookupReleaseGroup(
  mbid: string
): Promise<Record<string, unknown>> {
  const url = `${MB_API_BASE}/release-group/${mbid}?fmt=json&inc=artist-credits+tags+releases`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB lookup release-group error: ${res.status}`);
  return res.json();
}

export async function searchArtists(
  name: string,
  limit = 10
): Promise<
  { mbid: string; name: string; type: string | null; country: string | null; disambiguation: string | null }[]
> {
  const url = `${MB_API_BASE}/artist/?query=artist:"${encodeURIComponent(name)}"&fmt=json&limit=${limit}`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB search artist error: ${res.status}`);
  const body = await res.json();
  const artists = body.artists ?? [];
  return artists.map((a: Record<string, unknown>) => ({
    mbid: a.id as string,
    name: a.name as string,
    type: (a.type as string) ?? null,
    country: (a.country as string) ?? null,
    disambiguation: (a.disambiguation as string) ?? null,
  }));
}

export async function lookupArtist(
  mbid: string
): Promise<Record<string, unknown>> {
  const url = `${MB_API_BASE}/artist/${mbid}?fmt=json&inc=aliases+genres+tags+ratings+artist-rels+url-rels`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB lookup artist error: ${res.status}`);
  return res.json();
}

export async function browseReleaseGroupsByArtist(
  artistMbid: string,
  limit = 50
): Promise<
  { mbid: string; title: string; year: string | null; primaryType: string | null }[]
> {
  const url = `${MB_API_BASE}/release-group?artist=${artistMbid}&fmt=json&limit=${limit}`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB browse release-groups error: ${res.status}`);
  const body = await res.json();
  const rgs = body["release-groups"] ?? [];
  return rgs.map((rg: Record<string, unknown>) => ({
    mbid: rg.id as string,
    title: rg.title as string,
    year: ((rg["first-release-date"] as string) ?? "").slice(0, 4) || null,
    primaryType: (rg["primary-type"] as string) ?? null,
  }));
}

export async function lookupRelease(
  mbid: string
): Promise<Record<string, unknown>> {
  const url = `${MB_API_BASE}/release/${mbid}?fmt=json&inc=recordings+artist-credits`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`MB lookup release error: ${res.status}`);
  return res.json();
}

export async function getCoverArtUrl(
  rgMbid: string
): Promise<string | null> {
  const url = `${CAA_API_BASE}/release-group/${rgMbid}/`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const body = await res.json();
  const images = body.images as Record<string, unknown>[];
  if (!images?.length) return null;
  const front = images.find((img) => img.front === true || (img.types as string[])?.includes("Front"));
  const thumbnails = (front?.thumbnails ?? images[0]?.thumbnails) as Record<string, string>;
  return thumbnails?.large ?? thumbnails?.["500"] ?? thumbnails?.small ?? null;
}

export function extractArtistData(
  artist: Record<string, unknown>
): { mbid: string; nombre: string; generos: string[]; metadata: Record<string, unknown> } {
  const extractNames = (items: Record<string, unknown>[] | undefined): string[] =>
    (items ?? [])
      .filter((t) => !((t.name as string) ?? "").startsWith("_"))
      .slice(0, 10)
      .map((t) => t.name as string);

  const genres = extractNames(artist.genres as Record<string, unknown>[]);
  const tags = extractNames(artist.tags as Record<string, unknown>[]);
  const generos = genres.length > 0 ? genres : tags;

  const artistRels = ((artist["artist-rels"] as Record<string, unknown>[]) ?? []).map(
    (rel) => ({
      type: rel.type,
      direction: rel.direction,
      target_name: (rel.artist as Record<string, string>)?.name ?? null,
      target_mbid: (rel.artist as Record<string, string>)?.id ?? null,
      target_type: (rel["target-type"] as string) ?? null,
      begin: rel.begin ?? null,
      end: rel.end ?? null,
      ended: rel.ended ?? false,
      attributes: (rel.attributes as unknown[]) ?? [],
    })
  );

  const urlRels = ((artist["url-rels"] as Record<string, unknown>[]) ?? []).map(
    (rel) => ({
      type: rel.type,
      url: rel.target,
      begin: rel.begin ?? null,
      end: rel.end ?? null,
      ended: rel.ended ?? false,
    })
  );

  const aliases = ((artist.aliases as Record<string, unknown>[]) ?? []).map(
    (a) => ({
      name: a.name,
      sort_name: a["sort-name"],
      type: a.type ?? null,
      locale: a.locale ?? null,
      primary: a.primary ?? false,
    })
  );

  return {
    mbid: artist.id as string,
    nombre: artist.name as string,
    generos,
    metadata: {
      sort_name: artist["sort-name"] ?? null,
      disambiguation: artist.disambiguation ?? null,
      type: artist.type ?? null,
      type_id: artist["type-id"] ?? null,
      country: artist.country ?? null,
      area: artist.area ?? null,
      begin_area: artist["begin-area"] ?? null,
      end_area: artist["end-area"] ?? null,
      life_span: artist["life-span"] ?? null,
      gender: artist.gender ?? null,
      gender_id: artist["gender-id"] ?? null,
      isnis: artist.isnis ?? [],
      ipis: artist.ipis ?? [],
      aliases,
      genres,
      tags,
      rating: artist.rating ?? null,
      artist_rels: artistRels,
      url_rels: urlRels,
    },
  };
}

export function extractAlbumData(
  rg: Record<string, unknown>,
  coverUrl: string | null,
  artistaId: string | null
): {
  mbid: string;
  titulo: string;
  fecha_lanzamiento: string | null;
  cover_url: string | null;
  generos: string[];
  artista_id: string | null;
  metadata: Record<string, unknown>;
} {
  const artistCredit = (rg["artist-credit"] as Record<string, unknown>[]) ?? [];
  return {
    mbid: rg.id as string,
    titulo: rg.title as string,
    fecha_lanzamiento: getFirstDate(rg as Parameters<typeof getFirstDate>[0]),
    cover_url: coverUrl,
    generos: extractTags(rg as Parameters<typeof extractTags>[0]),
    artista_id: artistaId,
    metadata: {
      primary_type: rg["primary-type"] ?? null,
      secondary_types: rg["secondary-types"] ?? null,
      artist_credit: artistCredit.map((ac) => ({
        name: ac.name,
        artist_id: (ac.artist as Record<string, string>)?.id ?? null,
      })),
    },
  };
}

export function extractTrackData(
  track: { mbid: string; title: string; length: number | null; position: number },
  artistaId: string | null,
  albumId: string
): {
  mbid: string;
  titulo: string;
  duracion_ms: number | null;
  posicion: number;
  artista_id: string | null;
  album_id: string;
} {
  return {
    mbid: track.mbid,
    titulo: track.title,
    duracion_ms: track.length,
    posicion: track.position,
    artista_id: artistaId,
    album_id: albumId,
  };
}
