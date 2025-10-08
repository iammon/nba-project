import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.$queryRawUnsafe<{ id:number; name:string }[]>(`
    SELECT id, name FROM players ORDER BY id ASC LIMIT 100
  `);
  return NextResponse.json(players);
}
