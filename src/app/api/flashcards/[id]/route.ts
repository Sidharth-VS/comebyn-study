import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { flashcardSet, flashcard } from "@/src/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setId = params.id;

    // Fetch the flashcard set
    const [set] = await db
      .select()
      .from(flashcardSet)
      .where(
        and(
          eq(flashcardSet.id, setId),
          eq(flashcardSet.userId, session.user.id)
        )
      );

    if (!set) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });
    }

    // Fetch all flashcards for this set
    const cards = await db
      .select()
      .from(flashcard)
      .where(eq(flashcard.setId, setId))
      .orderBy(asc(flashcard.order));

    return NextResponse.json({
      success: true,
      set: {
        ...set,
        flashcards: cards,
      },
    });

  } catch (err) {
    console.error("❌ Fetch flashcard set failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setId = params.id;

    // Verify ownership before deleting
    const [set] = await db
      .select()
      .from(flashcardSet)
      .where(
        and(
          eq(flashcardSet.id, setId),
          eq(flashcardSet.userId, session.user.id)
        )
      );

    if (!set) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });
    }

    // Delete the set (flashcards will be cascade deleted)
    await db.delete(flashcardSet).where(eq(flashcardSet.id, setId));

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Delete flashcard set failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
