import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get("room_id");

    if (!room_id) {
        return NextResponse.json({ error: "Missing room_id" }, { status: 400 });
    }

    try{
        const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/${room_id}/pdf`, {
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

        const data = await backendRes.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Fetch PDFs failed:", error);
        return NextResponse.json({ success: false, error: (error as Error).message });
    }
}

export async function POST(request: NextRequest) {
    const { room_id, file_name, size, user_id, time } = await request.json();

    if (!room_id || !file_name || !size || !user_id || !time) {
        return NextResponse.json({ error: "Missing details" }, { status: 400 });
    }

    try {
        const name = file_name;
        const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/${room_id}/pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room_id: Number(room_id), name, size: Number(size), user_id, time }),
        });

        if (!backendRes.ok) {
            const errorText = await backendRes.text();
            return NextResponse.json(
                { success: false, error: errorText },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Fetch PDFs failed:", error);
        return NextResponse.json({ success: false, error: (error as Error).message });
    }
}