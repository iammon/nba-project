// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: "Missing username or password." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  // plain-text password check (since you said security doesn't matter here)
  if (!user || user.password !== password) {
    return NextResponse.json(
      { success: false, message: "Invalid username or password." },
      { status: 401 }
    );
  }

  // 🔍 Look for this user's favorites in user_fav
  const favRows = await prisma.$queryRaw<
    { user_id: number; favorite_player_id: number | null; favorite_team_id: number | null }[]
  >`
    SELECT user_id, favorite_player_id, favorite_team_id
    FROM user_fav
    WHERE user_id = ${user.id}
    ORDER BY user_id ASC
    LIMIT 1
  `;

  const fav = favRows[0] ?? null;
  const hasFavorites = !!fav;
  const favoritePlayerId = fav?.favorite_player_id ?? null;
  const favoriteTeamId = fav?.favorite_team_id ?? null;

  const res = NextResponse.json({
    success: true,
    hasFavorites,
    favoritePlayerId,
    favoriteTeamId,
  });

  // super basic "session" cookie
  res.cookies.set(
    "nba_session",
    JSON.stringify({ userId: user.id, username: user.username }),
    {
      httpOnly: false, // in real life: true + secure
      path: "/",
    }
  );

  return res;
}
