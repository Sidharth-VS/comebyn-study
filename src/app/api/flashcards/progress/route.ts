import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { flashcardProgress, flashcard, flashcardSet } from "@/src/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const setId = searchParams.get("setId");

    if (!setId) {
      return NextResponse.json({ error: "Set ID required" }, { status: 400 });
    }

    // Get all card IDs for this set
    const cards = await db
      .select({ id: flashcard.id })
      .from(flashcard)
      .where(eq(flashcard.setId, setId));

    const cardIds = cards.map(c => c.id);

    if (cardIds.length === 0) {
      return NextResponse.json({ success: true, progress: {} });
    }

    // Get progress for all cards in this set
    const progressData = await db
      .select()
      .from(flashcardProgress)
      .where(
        and(
          eq(flashcardProgress.userId, session.user.id),
          inArray(flashcardProgress.cardId, cardIds)
        )
      );

    // Convert to map for easy lookup
    const progressMap: { [key: string]: any } = {};
    progressData.forEach(p => {
      progressMap[p.cardId] = p;
    });

    return NextResponse.json({ success: true, progress: progressMap });

  } catch (err) {
    console.error("❌ Fetch progress failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, status, masteryLevel } = body;

    if (!cardId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if progress record exists
    const [existing] = await db
      .select()
      .from(flashcardProgress)
      .where(
        and(
          eq(flashcardProgress.userId, session.user.id),
          eq(flashcardProgress.cardId, cardId)
        )
      );

    if (existing) {
      // Update existing progress
      await db
        .update(flashcardProgress)
        .set({
          status,
          masteryLevel: masteryLevel !== undefined ? masteryLevel : existing.masteryLevel,
          lastReviewed: new Date(),
          reviewCount: existing.reviewCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(flashcardProgress.id, existing.id));
    } else {
      // Create new progress record
      await db.insert(flashcardProgress).values({
        userId: session.user.id,
        cardId,
        status,
        masteryLevel: masteryLevel || 0,
        lastReviewed: new Date(),
        reviewCount: 1,
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Update progress failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
