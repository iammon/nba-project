// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      // (You said you don't care about security, so plain compare is fine)
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check favorites
    const favRow = await prisma.$queryRaw<
      { favorite_team_id: number | null; favorite_player_id: number | null }[]
    >`
      SELECT favorite_team_id, favorite_player_id
      FROM user_fav
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const favorites = favRow[0] ?? null;
    const hasFavorites = !!favorites;
    const favoritePlayerId = favorites?.favorite_player_id ?? null;

    // Set a simple cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "nba_session",
      JSON.stringify({ userId: user.id, username: user.username }),
      {
        httpOnly: false, // fine for your simple app
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    return NextResponse.json({
      ok: true,
      userId: user.id,
      username: user.username,
      hasFavorites,
      favoritePlayerId,
    });
  } catch (err) {
    console.error("Error in /api/login", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
