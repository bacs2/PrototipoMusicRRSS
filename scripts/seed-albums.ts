import {
  searchReleaseGroups,
  searchArtists,
  browseReleaseGroupsByArtist,
  lookupReleaseGroup,
  lookupArtist,
  lookupRelease,
  getCoverArtUrl,
  extractArtistData,
  extractAlbumData,
  extractTrackData,
} from "./lib/musicbrainz";
import type { InsertArtista, InsertAlbum, InsertCancion } from "./lib/mapping";
import {
  insertArtist,
  insertAlbum,
  insertTracks,
  findAlbumByMbid,
} from "./lib/supabase-admin";
import { promptSelect, promptMultiSelect } from "./lib/interactive";

function log(...args: unknown[]) {
  console.log("  ", ...args);
}

function loadEnv(): void {
  try {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(".env");
    }
  } catch {
    // .env not found at cwd — rely on existing env vars
  }
}

function parseArgs(raw: string[]): {
  limit: number;
  artistMode: boolean;
  artistQuery: string | null;
  specs: { album: string; artist?: string }[];
} {
  let limit = 5;
  let artistMode = false;
  let artistQuery: string | null = null;
  const specs: { album: string; artist?: string }[] = [];

  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];

    if (arg === "--help") {
      return { limit, artistMode, artistQuery, specs: [] };
    }

    if (arg === "--limit") {
      const next = raw[++i];
      if (next) {
        limit = parseInt(next, 10);
        if (isNaN(limit) || limit < 1) limit = 5;
      }
      continue;
    }

    if (arg === "--artist") {
      artistMode = true;
      const next = raw[++i];
      if (next) {
        artistQuery = next.trim();
      }
      continue;
    }

    const parts = arg.split("|");
    if (parts.length >= 2) {
      specs.push({ album: parts[0].trim(), artist: parts[1].trim() });
    } else {
      specs.push({ album: arg.trim() });
    }
  }

  if (artistMode && !raw.includes("--limit")) {
    limit = 20;
  }

  return { limit, artistMode, artistQuery, specs };
}

function printUsage() {
  console.log("");
  console.log("Uso: npm run seed:albums [opciones] \"spec\" [\"spec\" ...]");
  console.log("");
  console.log("Opciones:");
  console.log("  --artist Nombre   Importar todos los albums de un artista (default: 20)");
  console.log("  --limit N         Max resultados por busqueda (default: 5 album, 20 artista)");
  console.log("  --help            Muestra esta ayuda");
  console.log("");
  console.log("Cada spec es \"Album\" o \"Album|Artista\":");
  console.log('  npm run seed:albums "Motomami|Rosalía"');
  console.log('  npm run seed:albums "Random Access Memories|Daft Punk"');
  console.log('  npm run seed:albums -- --limit 10 "Thriller|Michael Jackson"');
  console.log("  npm run seed:albums \"Thriller\"  (busqueda libre)");
  console.log("");
  console.log("Modo artista (importa todos los albums):");
  console.log('  npm run seed:albums -- --artist "Radiohead"');
  console.log('  npm run seed:albums -- --artist "Radiohead" --limit 50');
  console.log("");
}

async function importAlbum(
  mbid: string,
  knownArtist?: { id: string; name: string } | null
): Promise<{ title: string; tracks: number }> {
  const existing = await findAlbumByMbid(mbid);
  if (existing) {
    log("⚡ Ya existe en base de datos (ID:", existing.id + ")");
    return { title: "", tracks: 0 };
  }

  log("📦 Obteniendo datos del album...");
  const rg = await lookupReleaseGroup(mbid);

  let artistaId: string | null;
  if (knownArtist) {
    artistaId = knownArtist.id;
    log("🎤 Artista conocido:", knownArtist.name, "(ID:", artistaId + ")");
  } else {
    const artistCredit = (rg["artist-credit"] as Record<string, unknown>[]) ?? [];
    const artistMbId = (
      (artistCredit[0]?.artist as Record<string, string>)?.id ?? ""
    ).trim();
    if (!artistMbId) {
      log("❌ No se pudo determinar el artista");
      return { title: rg.title as string, tracks: 0 };
    }

    log("🎤 Buscando artista...");
    const mbArtist = await lookupArtist(artistMbId);

    const artistaData: InsertArtista = extractArtistData(mbArtist);
    artistaId = await insertArtist(artistaData);
    log("✅ Artista:", artistaData.nombre, "(ID:", artistaId + ")");
  }

  const releases = (rg.releases as Record<string, unknown>[]) ?? [];
  const bestRelease = releases.find(
    (r) => (r.status as string)?.toLowerCase() === "official"
  ) ?? releases[0];

  let rawTracks: { mbid: string; title: string; length: number | null; position: number }[] = [];

  if (bestRelease) {
    log(`🎵 Obteniendo tracks desde "${bestRelease.title as string}"...`);
    const releaseData = await lookupRelease(bestRelease.id as string);
    const media = (releaseData.media as Record<string, unknown>[]) ?? [];
    let pos = 0;
    for (const m of media) {
      const tracks = (m.tracks as Record<string, unknown>[]) ?? [];
      for (const t of tracks) {
        pos++;
        const rec = t.recording as Record<string, unknown> ?? {};
        rawTracks.push({
          mbid: rec.id as string,
          title: rec.title as string,
          length: (rec.length as number) ?? null,
          position: pos,
        });
      }
    }
  } else {
    log("⚠️  No se encontraron releases; se importara sin tracks");
  }

  log("🖼️  Buscando portada...");
  const coverUrl = await getCoverArtUrl(mbid);

  const albumData: InsertAlbum = extractAlbumData(rg, coverUrl, artistaId);
  const albumId = await insertAlbum(albumData);
  log("✅ Album:", albumData.titulo, "(ID:", albumId + ")");

  if (rawTracks.length > 0) {
    const tracksData: InsertCancion[] = rawTracks.map((t) =>
      extractTrackData(t, artistaId, albumId)
    );
    const insertedCount = await insertTracks(tracksData);
    log(
      `✅ ${insertedCount} tracks insertados${
        insertedCount < rawTracks.length
          ? ` (${rawTracks.length - insertedCount} ya existian)`
          : ""
      }`
    );
  }

  return { title: albumData.titulo, tracks: rawTracks.length };
}

async function importArtistFlow(artistQuery: string, albumLimit: number) {
  console.log(`\n🔍 Buscando artista: "${artistQuery}"...`);
  const artists = await searchArtists(artistQuery);
  if (artists.length === 0) {
    log("❌ No se encontraron artistas");
    return;
  }

  console.log("");
  artists.forEach((a, i) => {
    const type = a.type ? `[${a.type}]` : "";
    const country = a.country ?? "";
    const disambig = a.disambiguation ? ` — ${a.disambiguation}` : "";
    console.log(`  ${i + 1}. ${a.name} ${type} ${country}${disambig}`);
  });
  console.log("  s. Saltar");

  const choice = await promptSelect(artists.length);
  if (choice === "skip") {
    log("⏭️  Saltado");
    return;
  }

  const selected = artists[choice];
  log("🎤 Obteniendo datos del artista...");
  const mbArtist = await lookupArtist(selected.mbid);
  const artistaData = extractArtistData(mbArtist);
  const artistaId = await insertArtist(artistaData);
  log("✅ Artista:", artistaData.nombre, "(ID:", artistaId + ")");

  log(`📦 Buscando albums (${albumLimit} max)...`);
  const rgs = await browseReleaseGroupsByArtist(selected.mbid, albumLimit);

  if (rgs.length === 0) {
    log("❌ No se encontraron albums para este artista");
    return;
  }

  console.log("");
  rgs.forEach((rg, i) => {
    const type = rg.primaryType ? `[${rg.primaryType}]` : "";
    const year = rg.year ? `(${rg.year})` : "";
    console.log(`  ${i + 1}. ${rg.title} ${type} ${year}`);
  });
  console.log("");

  const albumIndices = await promptMultiSelect(rgs.length);
  if (albumIndices === "skip") {
    log("⏭️  Cancelado");
    return;
  }

  let imported = 0;
  let totalTracks = 0;
  for (const idx of albumIndices) {
    const rg = rgs[idx];
    log(`📥 Importando "${rg.title}"...`);
    try {
      const result = await importAlbum(rg.mbid, {
        id: artistaId,
        name: artistaData.nombre,
      });
      if (result.tracks > 0) {
        imported++;
        totalTracks += result.tracks;
      }
      if (result.title) {
        console.log(`  ✅ "${result.title}" importado exitosamente\n`);
      }
    } catch (err) {
      log("❌ Error:", (err as Error).message);
    }
  }

  console.log("═══════════════════════════════════");
  console.log(
    `✅ ${imported} album(es) importados de ${artistaData.nombre}`
  );
  if (totalTracks > 0) {
    console.log(`   Total de tracks: ${totalTracks}`);
  }
  console.log("═══════════════════════════════════");
}

async function main() {
  loadEnv();

  const { limit, artistMode, artistQuery, specs } = parseArgs(
    process.argv.slice(2)
  );

  if (artistMode && artistQuery) {
    await importArtistFlow(artistQuery, limit);
    return;
  }

  if (specs.length === 0) {
    printUsage();
    process.exit(0);
  }

  let imported = 0;
  let totalTracks = 0;

  for (const spec of specs) {
    const searchLabel = spec.artist
      ? `"${spec.album}" por "${spec.artist}"`
      : `"${spec.album}"`;
    console.log(`\n🔍 Buscando: ${searchLabel}...`);

    let results: {
      mbid: string;
      title: string;
      artist: string;
      year: string | null;
    }[];
    try {
      results = await searchReleaseGroups(spec.album, spec.artist, limit);
    } catch (err) {
      log("❌ Error al buscar:", (err as Error).message);
      continue;
    }

    if (results.length === 0) {
      log("❌ No se encontraron resultados");
      continue;
    }

    console.log("");
    results.forEach((r, i) => {
      const year = r.year ? `(${r.year})` : "";
      console.log(`  ${i + 1}. ${r.title} — ${r.artist} ${year}`);
    });
    console.log("  s. Saltar");

    const choice = await promptSelect(results.length);
    if (choice === "skip") {
      log("⏭️  Saltado");
      continue;
    }

    const selected = results[choice];
    log(`📥 Importando "${selected.title}"...`);

    try {
      const result = await importAlbum(selected.mbid);
      if (result.tracks > 0) {
        imported++;
        totalTracks += result.tracks;
      }
      console.log(
        `  ✅ "${result.title || selected.title}" importado exitosamente\n`
      );
    } catch (err) {
      log("❌ Error durante la importacion:", (err as Error).message);
    }
  }

  console.log("═══════════════════════════════════");
  console.log(
    `✅ Importacion completada: ${imported} album(es) de ${specs.length} solicitados`
  );
  if (totalTracks > 0) {
    console.log(`   Total de tracks: ${totalTracks}`);
  }
  console.log("═══════════════════════════════════");
}

main().catch((err) => {
  console.error("\n❌ Error fatal:", err.message);
  process.exit(1);
});
