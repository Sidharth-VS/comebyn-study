import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const action = formData.get("action");

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "File is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ detail: "Only pdf files allowed" }, { status: 400 });
    }

    if (action !== "summarize" && action !== "generate_quiz") {
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
    }

    const backendRes = await fetch(`${process.env.BACKEND_URL}/process_pdf`, {
      method: "POST",
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } 
  catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
