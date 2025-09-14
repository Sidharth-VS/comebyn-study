import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return NextResponse.json(
        { success: false, error: errorText },
        { status: backendRes.status }
      );
    }

    const roomArray = await backendRes.json();

    const room = Array.isArray(roomArray) ? roomArray[0] : roomArray;

    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error("❌ Error fetching room:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
