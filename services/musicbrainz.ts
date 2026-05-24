const API_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "RateRecord/0.1 (contact@example.com)";

export type MusicBrainzOptions = {
  entity: "artist" | "release-group" | "recording";
  query: string;
};

export const searchMusicBrainz = async ({
  entity,
  query,
}: MusicBrainzOptions) => {
  const url = new URL(`${API_BASE}/${entity}`);
  url.searchParams.set("query", query);
  url.searchParams.set("fmt", "json");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`MusicBrainz error: ${response.status}`);
  }

  return response.json();
};
