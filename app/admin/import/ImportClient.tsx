"use client";

import { useState, useRef } from "react";
import { Search, Loader2, Check, ChevronRight, Music2 } from "lucide-react";

type ArtistResult = { mbid: string; name: string; type: string | null; country: string | null; disambiguation: string | null };
type AlbumResult = { mbid: string; title: string; artist: string; year: string | null };
type ArtistAlbum = { mbid: string; title: string; year: string | null; primaryType: string | null };

type Step =
  | { id: "search" }
  | { id: "artist-albums"; artist: ArtistResult; albums: ArtistAlbum[] }
  | { id: "importing"; log: string[] }
  | { id: "done"; imported: number; skipped: number };

export function ImportClient() {
  const [mode, setMode] = useState<"artist" | "album">("artist");
  const [query, setQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [artistResults, setArtistResults] = useState<ArtistResult[]>([]);
  const [albumResults, setAlbumResults] = useState<AlbumResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResult | null>(null);
  const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(["Album", "EP"]));
  const [step, setStep] = useState<Step>({ id: "search" });
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const search = async () => {
    setError(null);
    setSearching(true);
    setArtistResults([]);
    setAlbumResults([]);
    setSelectedArtist(null);
    setSelectedAlbums(new Set());

    try {
      const res = await fetch("/api/admin/import/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, query, artist: artistQuery || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (mode === "artist") setArtistResults(data);
      else setAlbumResults(data);
    } catch {
      setError("Error al buscar.");
    } finally {
      setSearching(false);
    }
  };

  const loadArtistAlbums = async (artist: ArtistResult) => {
    setSearching(true);
    setError(null);
    setSelectedArtist(artist);
    try {
      const res = await fetch("/api/admin/import/artist-albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistMbid: artist.mbid, limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep({ id: "artist-albums", artist, albums: data });
    } catch {
      setError("Error al cargar álbumes.");
    } finally {
      setSearching(false);
    }
  };

  const toggleAlbum = (mbid: string) => {
    setSelectedAlbums((prev) => {
      const next = new Set(prev);
      if (next.has(mbid)) next.delete(mbid); else next.add(mbid);
      return next;
    });
  };

  const runImport = async (mbids: string[], artistId?: string, artistNombre?: string) => {
    const log: string[] = [];
    setStep({ id: "importing", log });

    const res = await fetch("/api/admin/import/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mbids, artistId, artistNombre }),
    });

    if (!res.body) return;
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === "log") {
            log.push(parsed.message);
            setStep({ id: "importing", log: [...log] });
            setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }), 50);
          } else if (parsed.type === "done") {
            setStep({ id: "done", imported: parsed.imported, skipped: parsed.skipped });
          }
        } catch {}
      }
    }
  };

  const reset = () => {
    setStep({ id: "search" });
    setArtistResults([]);
    setAlbumResults([]);
    setSelectedArtist(null);
    setSelectedAlbums(new Set());
    setQuery("");
    setArtistQuery("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Done state ── */}
      {step.id === "done" && (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <h2 className="font-headline text-2xl font-black text-on-surface">Importación completada</h2>
          <p className="text-on-surface-variant">
            <span className="font-bold text-on-surface">{step.imported}</span> álbum{step.imported !== 1 ? "es" : ""} importados
            {step.skipped > 0 && ` · ${step.skipped} omitidos (ya existían)`}
          </p>
          <button onClick={reset} className="rounded-full bg-gradient-to-br from-primary to-primary-dim px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity">
            Importar más
          </button>
        </div>
      )}

      {/* ── Importing log ── */}
      {step.id === "importing" && (
        <div className="rounded-2xl bg-surface-container-low p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <h2 className="font-headline text-lg font-black text-on-surface">Importando...</h2>
          </div>
          <div
            ref={logRef}
            className="h-64 overflow-y-auto rounded-xl bg-surface-container p-4 font-mono text-xs text-on-surface-variant space-y-0.5"
          >
            {step.log.map((line, i) => (
              <p key={i} className={line.startsWith("✅") ? "text-emerald-400" : line.startsWith("❌") ? "text-red-400" : ""}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Artist albums selection ── */}
      {step.id === "artist-albums" && (() => {
        const ALL_TYPES = ["Album", "EP", "Single", "Compilation", "Live", "Remix"];
        const presentTypes = [...new Set(step.albums.map((a) => a.primaryType ?? "Other"))];
        const filtered = step.albums.filter((a) => typeFilter.has(a.primaryType ?? "Other"));

        const toggleType = (t: string) => {
          setTypeFilter((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t); else next.add(t);
            return next;
          });
          setSelectedAlbums(new Set());
        };

        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-md">Release groups de</p>
                <h2 className="font-headline text-2xl font-black text-on-surface">{step.artist.name}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">{step.albums.length} en total de MusicBrainz</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setSelectedAlbums(new Set(filtered.map((a) => a.mbid)))} className="text-xs text-primary hover:underline">
                  Todos
                </button>
                <button onClick={() => setSelectedAlbums(new Set())} className="text-xs text-on-surface-variant hover:underline">
                  Ninguno
                </button>
              </div>
            </div>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.filter((t) => presentTypes.includes(t)).map((t) => {
                const count = step.albums.filter((a) => (a.primaryType ?? "Other") === t).length;
                const active = typeFilter.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                      active
                        ? "bg-primary/15 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-on-surface-variant"
                    }`}
                  >
                    {t} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-surface-container-low overflow-hidden">
              {filtered.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-on-surface-variant">
                  No hay resultados con los filtros seleccionados.
                </p>
              )}
              {filtered.map((album, i) => (
                <button
                  key={album.mbid}
                  onClick={() => toggleAlbum(album.mbid)}
                  className={`w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-surface-container transition-colors ${
                    i !== filtered.length - 1 ? "border-b border-outline-variant" : ""
                  } ${selectedAlbums.has(album.mbid) ? "bg-primary/5" : ""}`}
                >
                  <div className={`h-4 w-4 shrink-0 rounded border transition-colors ${selectedAlbums.has(album.mbid) ? "border-primary bg-primary" : "border-outline-variant"} flex items-center justify-center`}>
                    {selectedAlbums.has(album.mbid) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{album.title}</p>
                    <p className="text-xs text-on-surface-variant">
                      {album.primaryType ?? "Other"}{album.year ? ` · ${album.year}` : ""}
                    </p>
                  </div>
                  {album.year && <span className="text-xs text-on-surface-variant shrink-0">{album.year}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => runImport(Array.from(selectedAlbums), selectedArtist?.mbid, selectedArtist?.name)}
                disabled={selectedAlbums.size === 0}
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Music2 className="h-4 w-4" />
                Importar {selectedAlbums.size > 0 ? `${selectedAlbums.size} release${selectedAlbums.size !== 1 ? "s" : ""}` : "seleccionados"}
              </button>
              <button onClick={reset} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Search form ── */}
      {step.id === "search" && (
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-surface-container p-1 w-fit">
            {(["artist", "album"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setArtistResults([]); setAlbumResults([]); }}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  mode === m ? "bg-gradient-to-br from-primary to-primary-dim text-white shadow" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {m === "artist" ? "Por artista" : "Por álbum"}
              </button>
            ))}
          </div>

          {/* Search inputs */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={mode === "artist" ? "Nombre del artista..." : "Título del álbum..."}
                className="w-full rounded-xl bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
              />
            </div>
            {mode === "album" && (
              <input
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Artista (opcional)"
                className="w-44 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
              />
            )}
            <button
              onClick={search}
              disabled={searching || !query.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </button>
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-xs text-red-400">{error}</p>}

          {/* Artist results */}
          {artistResults.length > 0 && (
            <div className="rounded-2xl bg-surface-container-low overflow-hidden">
              {artistResults.map((a, i) => (
                <button
                  key={a.mbid}
                  onClick={() => loadArtistAlbums(a)}
                  disabled={searching}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container transition-colors disabled:opacity-50 ${
                    i !== artistResults.length - 1 ? "border-b border-outline-variant" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface">{a.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {[a.type, a.country, a.disambiguation].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-on-surface-variant shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Album results */}
          {albumResults.length > 0 && (
            <div className="rounded-2xl bg-surface-container-low overflow-hidden">
              {albumResults.map((a, i) => (
                <button
                  key={a.mbid}
                  onClick={() => runImport([a.mbid])}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container transition-colors ${
                    i !== albumResults.length - 1 ? "border-b border-outline-variant" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">{a.title}</p>
                    <p className="text-xs text-on-surface-variant">{a.artist}{a.year ? ` · ${a.year}` : ""}</p>
                  </div>
                  <span className="text-xs text-primary shrink-0">Importar →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
