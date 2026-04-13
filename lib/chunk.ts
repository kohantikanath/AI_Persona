const DEFAULT_CHUNK_SIZE = 900;
const DEFAULT_CHUNK_OVERLAP = 120;

type ChunkOptions = {
  chunkSize?: number;
  overlap?: number;
};

export function normalizeWhitespace(input: string) {
  return input.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function splitIntoChunks(input: string, options: ChunkOptions = {}) {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP;
  const normalized = normalizeWhitespace(input);

  if (!normalized) {
    return [];
  }

  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= chunkSize) {
      current = paragraph;
      continue;
    }

    let start = 0;

    while (start < paragraph.length) {
      const end = Math.min(start + chunkSize, paragraph.length);
      const slice = paragraph.slice(start, end).trim();

      if (slice) {
        chunks.push(slice);
      }

      if (end === paragraph.length) {
        break;
      }

      start = Math.max(end - overlap, start + 1);
    }

    current = "";
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}
