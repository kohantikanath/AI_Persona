import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateGroundedReplyWithGroq } from "@/lib/groq";
import { retrieveRelevantChunks } from "@/lib/retriever";

const requestSchema = z.object({
  message: z.string().min(1).max(2000)
});

export async function POST(request: NextRequest) {
  try {
    const payload = requestSchema.parse(await request.json());
    const chunks = await retrieveRelevantChunks(payload.message);
    const reply = await generateGroundedReplyWithGroq(payload.message, chunks);

    return NextResponse.json({
      answer: reply.answer,
      grounded: reply.grounded,
      mode: reply.mode,
      sources: chunks.map((chunk) => ({
        id: chunk.id,
        sourceType: chunk.sourceType,
        sourceName: chunk.sourceName,
        url: chunk.url,
        text: chunk.text
      }))
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat route failure.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
