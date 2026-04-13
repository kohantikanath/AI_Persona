import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVoiceAnswer } from "@/lib/voice";

const requestSchema = z.object({
  message: z.string().min(1).max(2000)
});

export async function POST(request: NextRequest) {
  try {
    const payload = requestSchema.parse(await request.json());
    const result = await getVoiceAnswer(payload.message);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected voice answer failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
