import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import {
  searchArtists,
  searchReleaseGroups,
} from "../../../../../scripts/lib/musicbrainz";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const { mode, query, artist } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "Query requerida." }, { status: 400 });

  if (mode === "artist") {
    const results = await searchArtists(query, 10);
    return NextResponse.json(results);
  }

  const results = await searchReleaseGroups(query, artist, 8);
  return NextResponse.json(results);
}
