import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { AdminArtistForm } from "./AdminArtistForm";

async function getData(id: string) {
  const db = supabaseAdmin();
  const [artistRes, albumsRes] = await Promise.all([
    db.from("Artistas").select("id, nombre, generos, avatar_url, bio").eq("id", id).single(),
    db.from("Albumes")
      .select("id, titulo, cover_url, fecha_lanzamiento, generos")
      .eq("artista_id", id)
      .order("fecha_lanzamiento", { ascending: false, nullsFirst: false }),
  ]);
  return { artist: artistRes.data, albums: albumsRes.data ?? [] };
}

export default async function AdminArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { artist, albums } = await getData(id);

  if (!artist) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="label-md">
          <Link href="/admin" className="hover:text-on-surface">Admin</Link>
          {" / "}
          <Link href="/admin/artists" className="hover:text-on-surface">Artistas</Link>
          {" / "}
          {artist.nombre}
        </p>
        <h1 className="font-headline text-4xl font-black text-on-surface">{artist.nombre}</h1>
      </div>

      <AdminArtistForm artist={artist} albums={albums} />
    </div>
  );
}
