import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const games = await prisma.$queryRawUnsafe<{
        id: BigInt;
        season: number | null;
        game_date: Date | null;
        home_team_id: number | null;
        visitor_team_id: number | null;
        home_points: number | null;
        visitor_points: number | null;
        home_team_wins: boolean | null;
    }[]>(`
        SELECT id, season, game_date, home_team_id, visitor_team_id, home_points, visitor_points, home_team_wins
        FROM games
        ORDER BY game_date DESC
        LIMIT 100
    `);
    return NextResponse.json(games);
}
