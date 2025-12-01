import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const players = await prisma.players.findMany({
    where: {
      name: {
        contains: q,
        mode: 'insensitive',
      },
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json({
    results: players.map((p) => ({
      id: p.id,
      name: p.name,
    })),
  });
}
