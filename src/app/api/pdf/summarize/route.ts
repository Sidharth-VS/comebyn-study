import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Invalid file type. Please upload a PDF." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/process_pdf`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    // Return the PDF as blob to frontend
    const pdfBuffer = await res.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${file.name.replace(".pdf", "_summary.pdf")}`,
      },
    });
  } catch (err) {
    console.error("❌ Summarization failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}