import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { AdminAlbumForm } from "./AdminAlbumForm";

async function getData(id: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("Albumes")
    .select("id, titulo, cover_url, fecha_lanzamiento, generos, Artistas(id, nombre)")
    .eq("id", id)
    .single();
  return data;
}

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getData(id);

  if (!album) notFound();

  const artista = album.Artistas as unknown as { id: string; nombre: string } | null;

  return (
    <div className="space-y-6">
      <div>
        <p className="label-md">
          <Link href="/admin" className="hover:text-on-surface">Admin</Link>
          {" / "}
          <Link href="/admin/albums" className="hover:text-on-surface">Álbumes</Link>
          {" / "}
          {album.titulo}
        </p>
        <h1 className="font-headline text-4xl font-black text-on-surface">{album.titulo}</h1>
        {artista && (
          <Link href={`/admin/artists/${artista.id}`} className="text-sm text-primary hover:underline">
            {artista.nombre}
          </Link>
        )}
      </div>

      <AdminAlbumForm
        album={{ id: album.id, titulo: album.titulo, cover_url: album.cover_url, fecha_lanzamiento: album.fecha_lanzamiento, generos: album.generos }}
        artistaNombre={artista?.nombre ?? "—"}
      />
    </div>
  );
}
