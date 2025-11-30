import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Save or update the user's favorites
export async function POST(req: NextRequest) {
  const { favoriteTeamId, favoritePlayerId } = await req.json();

  if (!favoriteTeamId || !favoritePlayerId) {
    return NextResponse.json(
      { success: false, message: 'Missing favorite team or player.' },
      { status: 400 },
    );
  }

  // Get user from the session cookie
  const sessionCookie = req.cookies.get('nba_session');

  if (!sessionCookie) {
    return NextResponse.json(
      { success: false, message: 'Not logged in.' },
      { status: 401 },
    );
  }

  let userId: number;

  try {
    const parsed = JSON.parse(sessionCookie.value);
    userId = parsed.userId;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid session.' },
      { status: 401 },
    );
  }

  try {
    // Upsert so we overwrite if they change their mind later
    const fav = await prisma.user_fav.upsert({
      where: { user_id: userId },          // requires UNIQUE(user_id)
      update: {
        favorite_player_id: favoritePlayerId,
        favorite_team_id: favoriteTeamId,
      },
      create: {
        user_id: userId,
        favorite_player_id: favoritePlayerId,
        favorite_team_id: favoriteTeamId,
      },
    });

    return NextResponse.json({ success: true, data: fav });
  } catch (err) {
    console.error('Error saving favorites:', err);
    return NextResponse.json(
      { success: false, message: 'Could not save favorites.' },
      { status: 500 },
    );
  }
}
