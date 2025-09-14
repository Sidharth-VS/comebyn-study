// app/api/room/create_room/route.ts (Next.js 13/14+ with App Router)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const details = await req.json(); // read body sent from createRoom()

    const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: `Backend error: ${backendRes.statusText}` },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Proxy create_room failed", err);
    return NextResponse.json(
      { detail: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}