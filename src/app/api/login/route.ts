// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: 'Missing username or password.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  // plain-text password check (because you said you don't care about security)
  if (!user || user.password !== password) {
    return NextResponse.json(
      { success: false, message: 'Invalid username or password.' },
      { status: 401 },
    );
  }

  // 🔍 Check if this user already has favorites in user_fav
  const favRows = await prisma.$queryRaw<{ user_id: number }[]>`
    SELECT user_id
    FROM user_fav
    WHERE user_id = ${user.id}
    LIMIT 1
  `;

  const hasFavorites = favRows.length > 0;

  // Create response and set cookie
  const res = NextResponse.json({ success: true, hasFavorites });

  res.cookies.set(
    'nba_session',
    JSON.stringify({ userId: user.id, username: user.username }),
    {
      httpOnly: false, // for real apps: true
      path: '/',
    },
  );

  return res;
}
