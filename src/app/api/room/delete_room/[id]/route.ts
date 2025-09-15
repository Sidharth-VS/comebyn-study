import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/${id}`, {
            method: "DELETE",
        });
        if (!backendRes.ok) {
            return NextResponse.json({ detail: `Backend error: ${backendRes.statusText}` }, { status: backendRes.status });
        }
        const data = await backendRes.json();
        return NextResponse.json(data);
    }
    catch (err: any) {
        console.error("❌ Proxy delete_room failed", err);
        return NextResponse.json({ detail: err.message || "Internal Server Error" }, { status: 500 });
    }
}