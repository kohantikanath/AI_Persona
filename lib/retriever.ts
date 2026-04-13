import { getSupabaseServerClient } from "@/lib/supabase";

export type RetrievedChunk = {
  id: string;
  sourceType: string;
  sourceName: string;
  url: string | null;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
};

type KnowledgeChunkRow = {
  id: string;
  source_type: string;
  source_name: string;
  url: string | null;
  chunk_text: string;
  metadata_json: Record<string, unknown>;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "what",
  "why",
  "with",
  "you"
]);

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function inferQueryIntent(query: string) {
  const lowered = query.toLowerCase();

  return {
    asksAboutResume:
      /resume|education|experience|background|university|college|school|skills?/.test(lowered),
    asksAboutRepos:
      /repo|github|project|projects|tech|stack|tradeoff|tradeoffs|built|build/.test(lowered),
    asksAboutFit:
      /fit|right person|hire|role|why|strength|strong|best/.test(lowered)
  };
}

function scoreChunk(
  query: string,
  queryTokens: string[],
  row: KnowledgeChunkRow
) {
  const haystack = `${row.source_name}\n${row.chunk_text}`.toLowerCase();
  let score = 0;
  const intent = inferQueryIntent(query);

  for (const token of queryTokens) {
    if (row.source_name.toLowerCase().includes(token)) {
      score += 6;
    }

    const matches = haystack.match(new RegExp(escapeRegex(token), "g"));
    if (matches?.length) {
      score += matches.length;
    }
  }

  if (row.source_name.toLowerCase() === "ai_persona") {
    score -= 12;
  }

  if (/your name|your-handle|samples~\/yourmechanicname/i.test(row.chunk_text)) {
    score -= 10;
  }

  if (intent.asksAboutResume && row.source_type === "resume") {
    score += 8;
  }

  if (intent.asksAboutRepos && row.source_type === "repo") {
    score += 8;
  }

  if (intent.asksAboutFit && row.source_type === "resume") {
    score += 4;
  }

  if (intent.asksAboutFit && row.source_type === "repo") {
    score += 3;
  }

  if (row.source_type === "resume") {
    score += 1;
  }

  return score;
}

export async function retrieveRelevantChunks(query: string, limit = 6) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("id, source_type, source_name, url, chunk_text, metadata_json");

  if (error) {
    throw error;
  }

  const queryTokens = tokenize(query);

  const scored = (data as KnowledgeChunkRow[])
    .map((row) => ({
      id: row.id,
      sourceType: row.source_type,
      sourceName: row.source_name,
      url: row.url,
      text: row.chunk_text,
      score: scoreChunk(query, queryTokens, row),
      metadata: row.metadata_json ?? {}
    }))
    .filter((row) => row.score > 1)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  return scored;
}
