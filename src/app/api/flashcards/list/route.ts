import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { flashcardSet } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all flashcard sets for this user
    const sets = await db
      .select()
      .from(flashcardSet)
      .where(eq(flashcardSet.userId, session.user.id))
      .orderBy(desc(flashcardSet.createdAt));

    return NextResponse.json({ success: true, sets });

  } catch (err) {
    console.error("❌ Fetch flashcard sets failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
