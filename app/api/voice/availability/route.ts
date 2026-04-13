import { NextResponse } from "next/server";
import { getVoiceAvailability } from "@/lib/voice";

export async function GET() {
  try {
    const result = await getVoiceAvailability();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected voice availability failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
