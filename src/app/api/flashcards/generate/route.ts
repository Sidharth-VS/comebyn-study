import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const difficulty = formData.get("difficulty") as string;
    const num_cards = formData.get("num_cards") as string;
    const topic_focus = formData.get("topic_focus") as string | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF." }, { status: 400 });
    }

    // Validate other required fields
    if (!difficulty || !num_cards) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Forward to Python backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("difficulty", difficulty);
    backendFormData.append("num_cards", num_cards);
    if (topic_focus) {
      backendFormData.append("topic_focus", topic_focus);
    }

    const res = await fetch(`${process.env.BACKEND_URL}/generate_flashcards`, {
      method: "POST",
      body: backendFormData,
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const flashcardData = await res.json();
    return NextResponse.json(flashcardData);

  } catch (err) {
    console.error("❌ Flashcard generation failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
