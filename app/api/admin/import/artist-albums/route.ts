import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { browseReleaseGroupsByArtist } from "../../../../../scripts/lib/musicbrainz";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { artistMbid, limit } = await req.json();
  if (!artistMbid) return NextResponse.json({ error: "artistMbid requerido." }, { status: 400 });

  const albums = await browseReleaseGroupsByArtist(artistMbid, limit ?? 30);
  return NextResponse.json(albums);
}
