import satori from "satori";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getReviewShareData } from "../../../../services/catalog";

const fontFile = path.join(process.cwd(), "public", "SpaceGrotesk-Regular.ttf");

export async function GET(
  _request: Request,
  { params }: { params: { reviewId: string } }
) {
  const data = await getReviewShareData(params.reviewId);
  if (!data) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const fontData = await readFile(fontFile);

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        background: "linear-gradient(135deg, #0b0b0b 0%, #171717 100%)",
        color: "#f5f5f5",
        fontFamily: "Space Grotesk",
        padding: "48px",
        gap: "32px",
      }}
    >
      <div
        style={{
          width: "320px",
          height: "320px",
          borderRadius: "24px",
          background: data.coverUrl
            ? `url(${data.coverUrl}) center/cover`
            : "linear-gradient(135deg, #262626, #0f172a)",
          border: "1px solid #262626",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 22, letterSpacing: 6, opacity: 0.6 }}>
          RateRecord
        </div>
        <div style={{ fontSize: 46, fontWeight: 600, marginTop: 12 }}>
          {data.itemTitle}
        </div>
        <div style={{ fontSize: 22, marginTop: 6, opacity: 0.7 }}>
          {data.itemSubtitle}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {data.rating.toFixed(1)}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 22,
            lineHeight: 1.4,
            opacity: 0.9,
          }}
        >
          {data.comment ?? ""}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Space Grotesk",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
