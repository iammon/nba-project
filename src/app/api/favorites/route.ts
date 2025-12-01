// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1) Read session cookie
    const cookieStore = await cookies();
    const sessionRaw = cookieStore.get("nba_session")?.value;

    if (!sessionRaw) {
      return NextResponse.json(
        { message: "Not logged in" },
        { status: 401 }
      );
    }

    let session: { userId: number; username: string };
    try {
      session = JSON.parse(sessionRaw);
    } catch {
      return NextResponse.json(
        { message: "Invalid session" },
        { status: 400 }
      );
    }

    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { message: "Invalid session (no userId)" },
        { status: 400 }
      );
    }

    // 2) Read body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const favoriteTeamId = body.favoriteTeamId as number | undefined;
    const favoritePlayerId = body.favoritePlayerId as number | undefined;

    if (!favoriteTeamId || !favoritePlayerId) {
      return NextResponse.json(
        { message: "favoriteTeamId and favoritePlayerId are required" },
        { status: 400 }
      );
    }

    // 3) Optional: sanity check that team & player exist
    const [team, player] = await Promise.all([
      prisma.teams.findUnique({ where: { id: favoriteTeamId } }),
      prisma.players.findUnique({ where: { id: favoritePlayerId } }),
    ]);

    if (!team || !player) {
      return NextResponse.json(
        { message: "Team or player not found in database" },
        { status: 400 }
      );
    }

    // 4) Upsert into user_fav with raw SQL
    // Delete existing row
    await prisma.$executeRawUnsafe(
      `DELETE FROM user_fav WHERE user_id = $1`,
      userId
    );

    // Insert new
    await prisma.$executeRawUnsafe(
      `INSERT INTO user_fav (user_id, favorite_team_id, favorite_player_id)
       VALUES ($1, $2, $3)`,
      userId,
      favoriteTeamId,
      favoritePlayerId
    );

    return NextResponse.json({
      ok: true,
      message: "Favorites saved",
      favoritePlayerId,
      favoriteTeamId,
    });
  } catch (err) {
    console.error("Error in /api/favorites", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
