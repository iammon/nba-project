// src/app/api/register/route.ts
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

  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(password).trim();

  if (!trimmedUsername || !trimmedPassword) {
    return NextResponse.json(
      { success: false, message: 'Username and password cannot be empty.' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        password: trimmedPassword, // plain text
      },
    });

    // New user → definitely no favorites yet
    const hasFavorites = false;

    const res = NextResponse.json({ success: true, hasFavorites });

    res.cookies.set(
      'nba_session',
      JSON.stringify({ userId: user.id, username: user.username }),
      {
        httpOnly: false,
        path: '/',
      },
    );

    return res;
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Username is already taken.' },
        { status: 409 },
      );
    }

    console.error('Register error:', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
