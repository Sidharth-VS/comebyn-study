import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("herre");
  try {
    const formData = await req.formData();

    const backendRes = await fetch(`${process.env.BACKEND_URL}/upload_pdf`, {
      method: "POST",
      body: formData,
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
