import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const backendRes = await fetch(`${process.env.BACKEND_URL}/rooms/all`, {
        method: "GET",
        });

        const data = await backendRes.json();
        return NextResponse.json(data);
    } 
    catch (err: any) {
        return NextResponse.json(
        { detail: err.message || "Internal Server Error" },
        { status: 500 }
        );
    }
}
