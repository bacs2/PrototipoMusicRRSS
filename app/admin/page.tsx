import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase/admin";
import { Music, Disc3, Mic2, Users, Download } from "lucide-react";

async function getStats() {
  const db = supabaseAdmin();
  const [artists, albums, songs, users] = await Promise.all([
    db.from("Artistas").select("id", { count: "exact", head: true }),
    db.from("Albumes").select("id", { count: "exact", head: true }),
    db.from("Canciones").select("id", { count: "exact", head: true }),
    db.from("Datos_usuario").select("id", { count: "exact", head: true }),
  ]);
  return {
    artists: artists.count ?? 0,
    albums: albums.count ?? 0,
    songs: songs.count ?? 0,
    users: users.count ?? 0,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Artistas", value: stats.artists, icon: Mic2, href: "/admin/artists" },
    { label: "Álbumes", value: stats.albums, icon: Disc3, href: "/admin/albums" },
    { label: "Canciones", value: stats.songs, icon: Music, href: null },
    { label: "Usuarios", value: stats.users, icon: Users, href: null },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="label-md">Panel</p>
        <h1 className="font-headline text-4xl font-black text-on-surface">Admin</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const inner = (
            <div className="rounded-2xl bg-surface-container-low p-5 space-y-3 h-full">
              <div className="flex items-center justify-between">
                <p className="label-md">{label}</p>
                <Icon className="h-4 w-4 text-on-surface-variant" />
              </div>
              <p className="font-headline text-4xl font-black text-primary">{value}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href} className="hover:opacity-80 transition-opacity">
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/artists"
          className="rounded-2xl bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container transition-colors"
        >
          <div>
            <p className="label-md mb-1">Catálogo</p>
            <h2 className="font-headline text-xl font-black">Gestionar artistas</h2>
            <p className="text-sm text-on-surface-variant mt-1">Edita nombre, bio, avatar y géneros</p>
          </div>
          <Mic2 className="h-8 w-8 text-primary shrink-0" />
        </Link>
        <Link
          href="/admin/albums"
          className="rounded-2xl bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container transition-colors"
        >
          <div>
            <p className="label-md mb-1">Catálogo</p>
            <h2 className="font-headline text-xl font-black">Gestionar álbumes</h2>
            <p className="text-sm text-on-surface-variant mt-1">Edita portada, título, géneros y fecha</p>
          </div>
          <Disc3 className="h-8 w-8 text-primary shrink-0" />
        </Link>
        <Link
          href="/admin/import"
          className="rounded-2xl bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container transition-colors"
        >
          <div>
            <p className="label-md mb-1">MusicBrainz</p>
            <h2 className="font-headline text-xl font-black">Importar catálogo</h2>
            <p className="text-sm text-on-surface-variant mt-1">Busca e importa artistas y álbumes</p>
          </div>
          <Download className="h-8 w-8 text-primary shrink-0" />
        </Link>
      </div>
    </div>
  );
}
