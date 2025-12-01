import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const teams = await prisma.teams.findMany({
    where: {
      OR: [
        {
          nickname: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          abbreviation: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ],
    },
    take: 10,
    orderBy: {
      nickname: 'asc',
    },
  });

  return NextResponse.json({
    results: teams.map((t) => ({
      id: t.id,
      name: `${t.city} ${t.nickname} (${t.abbreviation})`,
    })),
  });
}
