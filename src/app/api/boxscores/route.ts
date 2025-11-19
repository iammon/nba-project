// src/app/api/boxscore
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("game_id");

  if (!gameId) {
    return NextResponse.json(
      { error: "Missing ?game_id" },
      { status: 400 }
    );
  }

  const rows = await prisma.$queryRawUnsafe<{
    game_id: bigint;
    player_id: number;
    player_name: string;
    team_name: string | null;
    team_abbr: string | null;
    season: number | null;
    game_date: Date;
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
  }[]>(`
    SELECT
      b.game_id,
      b.player_id,
      p.name AS player_name,
      t.full_name AS team_name,
      t.abbreviation AS team_abbr,
      g.season,
      g.game_date,
      b.pts, b.reb, b.ast,
      b.fgm, b.fga,
      b.fg3m, b.fg3a,
      b.ftm, b.fta,
      b.stl, b.blk, b.tov
    FROM boxscores b
    INNER JOIN players p ON b.player_id = p.id
    INNER JOIN games g ON b.game_id = g.id
    LEFT JOIN teams t ON b.team_id = t.id
    WHERE b.game_id = ${gameId}
    ORDER BY p.name ASC
  `);

  return NextResponse.json(rows);
}
