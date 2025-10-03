import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const difficulty = formData.get("difficulty") as string;
    const num_questions = formData.get("num_questions") as string;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF." }, { status: 400 });
    }

    // Validate other required fields
    if (!difficulty || !num_questions) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Forward to your Python backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("difficulty", difficulty);
    backendFormData.append("num_questions", num_questions);

    const res = await fetch(`${process.env.BACKEND_URL}/generate_quiz`, {
      method: "POST",
      body: backendFormData,
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const quizData = await res.json();
    return NextResponse.json(quizData);

  } catch (err) {
    console.error("❌ Quiz generation failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}