// src/app/api/delete-account/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("nba_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { message: "Not logged in" },
      { status: 401 }
    );
  }

  let userId: number | null = null;

  try {
    const parsed = JSON.parse(sessionCookie) as { userId?: number };
    if (typeof parsed.userId === "number") {
      userId = parsed.userId;
    }
  } catch {
    // invalid cookie
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Invalid session" },
      { status: 400 }
    );
  }

  try {
    // Delete favorites + user in a transaction
    await prisma.$transaction([
      prisma.$executeRaw`DELETE FROM user_fav WHERE user_id = ${userId}`,
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Clear the cookie
    const res = NextResponse.json({ ok: true, message: "Account deleted" });
    res.cookies.set("nba_session", "", {
      path: "/",
      expires: new Date(0),
    });
    return res;
  } catch (err) {
    console.error("Error deleting account:", err);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
