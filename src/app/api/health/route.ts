import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // if alias not set, use "../../lib/prisma"

export async function GET() {
  const [{ now }] = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
  return NextResponse.json({ ok: true, now });
}
