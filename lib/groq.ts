import { env } from "@/lib/env";
import type { RetrievedChunk } from "@/lib/retriever";

type GroundedCompletion = {
  answer: string;
  grounded: boolean;
  mode: "groq";
};

function buildContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      const urlLine = chunk.url ? `URL: ${chunk.url}` : "URL: none";
      return [
        `Source ${index + 1}`,
        `Type: ${chunk.sourceType}`,
        `Name: ${chunk.sourceName}`,
        urlLine,
        `Content: ${chunk.text}`
      ].join("\n");
    })
    .join("\n\n");
}

function extractText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const choices = (payload as { choices?: Array<{ message?: { content?: string } }> }).choices;
  return choices?.[0]?.message?.content?.trim() ?? "";
}

export async function generateGroundedReplyWithGroq(
  query: string,
  chunks: RetrievedChunk[]
): Promise<GroundedCompletion> {
  if (!chunks.length) {
    return {
      grounded: false,
      mode: "groq",
      answer:
        "I do not have enough grounded information in the current resume and GitHub data to answer that honestly yet."
    };
  }

  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env.local.");
  }

  const response = await fetch(`${env.GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "You are the candidate's AI representative.",
            "Answer only from the provided sources about the candidate's actual resume and GitHub.",
            "Do not invent companies, dates, skills, repositories, outcomes, or education details.",
            "If the evidence is incomplete, say so directly.",
            "Be specific, natural, and concise.",
            "Do not quote raw source dumps back to the user.",
            "Synthesize a clean answer from the evidence."
          ].join(" ")
        },
        {
          role: "user",
          content: [
            "User question:",
            query,
            "",
            "Retrieved sources:",
            buildContext(chunks),
            "",
            "Return plain text only."
          ].join("\n")
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq request failed for model ${env.GROQ_MODEL}: ${response.status} ${errorText}`
    );
  }

  const payload = await response.json();
  const answer = extractText(payload);

  if (!answer) {
    throw new Error("Groq returned an empty response.");
  }

  return {
    grounded: true,
    mode: "groq",
    answer
  };
}
