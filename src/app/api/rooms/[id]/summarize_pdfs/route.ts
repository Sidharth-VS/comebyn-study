import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/${id}/summarize_pdfs`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return NextResponse.json(
        { success: false, error: errorText },
        { status: backendRes.status }
      );
    }

    const blob = await backendRes.blob();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="summary.pdf"`,
      },
    });
  } catch (err) {
    console.error("❌ Error downloading summary PDF:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
