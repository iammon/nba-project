import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const teams = await prisma.$queryRawUnsafe<{
        id: number;
        nickname: string | null;
        abbreviation: string | null;
        city: string | null;
        min_year: number | null;
        max_year: number | null;
    }[]>(`
        SELECT id, abbreviation, nickname, city, min_year, max_year
        FROM teams
        ORDER BY city ASC, nickname ASC
        LIMIT 100
    `);
    return NextResponse.json(teams);
}