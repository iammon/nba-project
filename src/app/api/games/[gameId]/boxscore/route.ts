// src/app/api/games/[gameId]/boxscore/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    
    const boxscores = await prisma.$queryRaw<{
      game_id: bigint;
      player_id: number;
      player_name: string;
      team_id: number | null;
      team_name: string | null;
      team_abbr: string | null;
      pts: number | null;
      ast: number | null;
      reb: number | null;
      fgm: number | null;
      fga: number | null;
      fg3m: number | null;
      fg3a: number | null;
      ftm: number | null;
      fta: number | null;
      stl: number | null;
      blk: number | null;
      tov: number | null;
      pf: number | null;
      minutes_raw: string | null;
    }[]>`
      SELECT
        b.game_id,
        b.player_id,
        p.name AS player_name,
        b.team_id,
        t.full_name AS team_name,
        t.abbreviation AS team_abbr,
        b.pts, b.reb, b.ast,
        b.fgm, b.fga,
        b.fg3m, b.fg3a,
        b.ftm, b.fta,
        b.stl, b.blk, b.tov, b.pf,
        b.minutes_raw
      FROM boxscores b
      INNER JOIN players p ON b.player_id = p.id
      LEFT JOIN teams t ON b.team_id = t.id
      WHERE b.game_id = ${BigInt(gameId)}
      ORDER BY b.pts DESC NULLS LAST, p.name ASC
    `;

    return NextResponse.json(boxscores);
  } catch (error) {
    console.error("Error fetching boxscore:", error);
    return NextResponse.json(
      { error: "Failed to fetch boxscore data" },
      { status: 500 }
    );
  }
}
