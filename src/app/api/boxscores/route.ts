import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChildProcessWithoutNullStreams } from "child_process";

export async function GET() {
    const boxscores = await prisma.$queryRawUnsafe<{
        game_id: bigint;
        player_id: number;
        team_id: number | null;
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
        SELECT game_id, player_id, team_id, pts, ast, reb, fgm, fg3m, fg3a, ftm, fta, stl, blk, tov
        FROM boxscores
        ORDER BY game_id DESC
        LIMIT 100
    `);
    return NextResponse.json(boxscores);
}