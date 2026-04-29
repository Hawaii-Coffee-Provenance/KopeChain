import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, name, batchName, groupId } = await req.json();

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: content,
        pinataMetadata: {
          name,
          keyvalues: { batchName },
        },
        pinataOptions: {
          groupId: groupId ?? undefined,
        },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/pin/json:", error);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
