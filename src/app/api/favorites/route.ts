// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("nba_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { message: "Not logged in" },
      { status: 401 }
    );
  }

  let userId: number | null = null;
  try {
    const parsed = JSON.parse(sessionCookie) as { userId?: number };
    if (typeof parsed.userId === "number") {
      userId = parsed.userId;
    }
  } catch {
    // ignore
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Invalid session" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const favoritePlayerId: number | null =
    typeof body.favoritePlayerId === "number" ? body.favoritePlayerId : null;
  const favoriteTeamId: number | null =
    typeof body.favoriteTeamId === "number" ? body.favoriteTeamId : null;

  if (favoritePlayerId == null || favoriteTeamId == null) {
    return NextResponse.json(
      { message: "favoritePlayerId and favoriteTeamId are required" },
      { status: 400 }
    );
  }

  // Upsert into user_fav
  await prisma.$executeRaw`
    INSERT INTO user_fav (user_id, favorite_player_id, favorite_team_id)
    VALUES (${userId}, ${favoritePlayerId}, ${favoriteTeamId})
    ON CONFLICT (user_id)
    DO UPDATE
      SET favorite_player_id = EXCLUDED.favorite_player_id,
          favorite_team_id   = EXCLUDED.favorite_team_id
  `;

  return NextResponse.json({ ok: true });
}
