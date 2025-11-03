import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db";
import { flashcardSet, flashcard } from "@/src/db/schema";

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
    const { title, flashcards, difficulty, sourcePdf, topicFocus } = body;

    if (!title || !flashcards || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create flashcard set
    const [newSet] = await db.insert(flashcardSet).values({
      userId: session.user.id,
      title,
      sourcePdf: sourcePdf || null,
      difficulty,
      topicFocus: topicFocus || null,
      totalCards: flashcards.length,
    }).returning();

    // Insert all flashcards
    const flashcardValues = flashcards.map((card: any, index: number) => ({
      setId: newSet.id,
      type: card.type,
      frontContent: card.frontContent || card.front,
      backContent: card.backContent || card.back,
      order: card.order !== undefined ? card.order : index,
    }));

    await db.insert(flashcard).values(flashcardValues);

    return NextResponse.json({ success: true, setId: newSet.id });

  } catch (err) {
    console.error("❌ Save flashcard set failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
