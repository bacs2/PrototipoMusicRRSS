import { getCurrentUser } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";
import {
  lookupReleaseGroup,
  lookupArtist,
  lookupRelease,
  getCoverArtUrl,
  extractArtistData,
  extractAlbumData,
  extractTrackData,
} from "../../../../../scripts/lib/musicbrainz";

type LogLine =
  | { type: "log"; message: string }
  | { type: "done"; imported: number; skipped: number }
  | { type: "error"; message: string };

async function importAlbum(
  mbid: string,
  knownArtist: { id: string; nombre: string } | null,
  send: (line: LogLine) => void
): Promise<boolean> {
  const db = supabaseAdmin();

  const { data: existing } = await db.from("Albumes").select("id").eq("mbid", mbid).maybeSingle();
  if (existing) {
    send({ type: "log", message: `⚡ Ya existe en la base de datos, se omite.` });
    return false;
  }

  send({ type: "log", message: "📦 Obteniendo datos del álbum..." });
  const rg = await lookupReleaseGroup(mbid);

  let artistaId: string;
  // knownArtist.id is the MusicBrainz MBID — resolve to Supabase UUID
  const artistMbidToResolve = knownArtist?.id ?? null;

  if (artistMbidToResolve) {
    const { data: existingArtist } = await db.from("Artistas").select("id").eq("mbid", artistMbidToResolve).maybeSingle();
    if (existingArtist) {
      artistaId = existingArtist.id;
      send({ type: "log", message: `🎤 Artista: ${knownArtist!.nombre}` });
    } else {
      send({ type: "log", message: `🎤 Insertando artista: ${knownArtist!.nombre}...` });
      const mbArtist = await lookupArtist(artistMbidToResolve);
      const artistData = extractArtistData(mbArtist);
      const { data: newArtist, error } = await db.from("Artistas").insert(artistData).select("id").single();
      if (error || !newArtist) {
        send({ type: "log", message: `❌ Error al insertar artista: ${error?.message}` });
        return false;
      }
      artistaId = newArtist.id;
      send({ type: "log", message: `✅ Artista insertado: ${artistData.nombre}` });
    }
  } else {
    const artistCredit = (rg["artist-credit"] as Record<string, unknown>[]) ?? [];
    const artistMbid = ((artistCredit[0]?.artist as Record<string, string>)?.id ?? "").trim();
    if (!artistMbid) {
      send({ type: "log", message: "❌ No se pudo determinar el artista." });
      return false;
    }

    send({ type: "log", message: "🎤 Buscando artista en MusicBrainz..." });
    const mbArtist = await lookupArtist(artistMbid);
    const artistData = extractArtistData(mbArtist);

    const { data: existingArtist } = await db.from("Artistas").select("id").eq("mbid", artistData.mbid).maybeSingle();
    if (existingArtist) {
      artistaId = existingArtist.id;
      send({ type: "log", message: `🎤 Artista ya existe: ${artistData.nombre}` });
    } else {
      const { data: newArtist, error } = await db.from("Artistas").insert(artistData).select("id").single();
      if (error || !newArtist) {
        send({ type: "log", message: `❌ Error al insertar artista: ${error?.message}` });
        return false;
      }
      artistaId = newArtist.id;
      send({ type: "log", message: `✅ Artista insertado: ${artistData.nombre}` });
    }
  }

  send({ type: "log", message: "🖼️  Buscando portada..." });
  const coverUrl = await getCoverArtUrl(mbid);

  const releases = (rg.releases as Record<string, unknown>[]) ?? [];
  const bestRelease = releases.find((r) => (r.status as string)?.toLowerCase() === "official") ?? releases[0];

  let tracks: { mbid: string; title: string; length: number | null; position: number }[] = [];
  if (bestRelease) {
    send({ type: "log", message: `🎵 Obteniendo tracks...` });
    const releaseData = await lookupRelease(bestRelease.id as string);
    const media = (releaseData.media as Record<string, unknown>[]) ?? [];
    let pos = 0;
    for (const m of media) {
      for (const t of (m.tracks as Record<string, unknown>[]) ?? []) {
        pos++;
        const rec = (t.recording as Record<string, unknown>) ?? {};
        tracks.push({ mbid: rec.id as string, title: rec.title as string, length: (rec.length as number) ?? null, position: pos });
      }
    }
  }

  const albumData = extractAlbumData(rg, coverUrl, artistaId);
  const { data: newAlbum, error: albumError } = await db.from("Albumes").insert(albumData).select("id").single();
  if (albumError || !newAlbum) {
    send({ type: "log", message: `❌ Error al insertar álbum: ${albumError?.message}` });
    return false;
  }
  send({ type: "log", message: `✅ Álbum: ${albumData.titulo}` });

  if (tracks.length > 0) {
    const tracksData = tracks.map((t) => extractTrackData(t, artistaId, newAlbum.id));
    const existingMbids = new Set(
      (await db.from("Canciones").select("mbid").in("mbid", tracksData.map((t) => t.mbid))).data?.map((r) => r.mbid) ?? []
    );
    const toInsert = tracksData.filter((t) => !existingMbids.has(t.mbid));
    if (toInsert.length > 0) {
      await db.from("Canciones").insert(toInsert);
    }
    send({ type: "log", message: `🎵 ${toInsert.length} tracks insertados` });
  }

  return true;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.is_admin) {
    return new Response(JSON.stringify({ error: "No autorizado." }), { status: 403 });
  }

  const { mbids, artistId, artistNombre } = await req.json();
  if (!mbids?.length) {
    return new Response(JSON.stringify({ error: "mbids requeridos." }), { status: 400 });
  }

  const knownArtist = artistId && artistNombre ? { id: artistId, nombre: artistNombre } : null;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: LogLine) => {
        controller.enqueue(enc.encode(JSON.stringify(line) + "\n"));
      };

      let imported = 0;
      let skipped = 0;

      for (const mbid of mbids) {
        send({ type: "log", message: `\n📥 Importando MBID: ${mbid}` });
        try {
          const ok = await importAlbum(mbid, knownArtist, send);
          if (ok) imported++; else skipped++;
        } catch (err) {
          send({ type: "log", message: `❌ Error: ${(err as Error).message}` });
          skipped++;
        }
      }

      send({ type: "done", imported, skipped });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
