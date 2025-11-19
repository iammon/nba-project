// src/app/api/games/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json([]);
    }

    const games = await prisma.$queryRaw<{
      id: bigint;
      season: number | null;
      game_date: Date | null;
      home_points: number | null;
      visitor_points: number | null;
      home_team_wins: boolean | null;
      home_city: string | null;
      home_nickname: string | null;
      home_abbr: string | null;
      visitor_city: string | null;
      visitor_nickname: string | null;
      visitor_abbr: string | null;
    }[]>`
      SELECT 
        g.id,
        g.season,
        g.game_date,
        g.home_points,
        g.visitor_points,
        g.home_team_wins,
        ht.city as home_city,
        ht.nickname as home_nickname,
        ht.abbreviation as home_abbr,
        vt.city as visitor_city,
        vt.nickname as visitor_nickname,
        vt.abbreviation as visitor_abbr
      FROM games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams vt ON g.visitor_team_id = vt.id
      WHERE 
        ht.city ILIKE ${`%${q}%`}
        OR ht.nickname ILIKE ${`%${q}%`}
        OR ht.abbreviation ILIKE ${`%${q}%`}
        OR vt.city ILIKE ${`%${q}%`}
        OR vt.nickname ILIKE ${`%${q}%`}
        OR vt.abbreviation ILIKE ${`%${q}%`}
        OR CAST(g.season AS TEXT) ILIKE ${`%${q}%`}
      ORDER BY g.game_date DESC, g.id DESC
      LIMIT 100
    `;

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error searching games:", error);
    return NextResponse.json(
      { error: "Failed to search games" },
      { status: 500 }
    );
  }
}
