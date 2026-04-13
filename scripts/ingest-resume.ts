import "./load-env";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { getSupabaseServerClient } from "../lib/supabase";
import { splitIntoChunks } from "../lib/chunk";

const RESUME_DIR = path.join(process.cwd(), "data", "resume");
const SUPPORTED_EXTENSIONS = new Set([".pdf", ".docx", ".md", ".txt"]);

async function getResumeFilePath() {
  const entries = await readdir(RESUME_DIR, { withFileTypes: true });
  const file = entries.find((entry) => {
    return entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase());
  });

  if (!file) {
    throw new Error("No resume file found in data/resume. Add a .pdf, .docx, .md, or .txt file.");
  }

  return path.join(RESUME_DIR, file.name);
}

async function extractText(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".md" || extension === ".txt") {
    return readFile(filePath, "utf8");
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (extension === ".pdf") {
    const buffer = await readFile(filePath);
    const result = await pdfParse(buffer);
    return result.text;
  }

  throw new Error(`Unsupported resume file type: ${extension}`);
}

async function main() {
  const filePath = await getResumeFilePath();
  const text = await extractText(filePath);
  const chunks = splitIntoChunks(text);

  if (!chunks.length) {
    throw new Error("Resume text was empty after parsing.");
  }

  const supabase = getSupabaseServerClient();

  await supabase.from("knowledge_chunks").delete().eq("source_type", "resume");

  const rows = chunks.map((chunk, index) => ({
    source_type: "resume",
    source_name: path.basename(filePath),
    url: null,
    chunk_text: chunk,
    metadata_json: {
      chunkIndex: index,
      filePath
    }
  }));

  const { error } = await supabase.from("knowledge_chunks").insert(rows);

  if (error) {
    throw error;
  }

  console.log(`Inserted ${rows.length} resume chunks from ${path.basename(filePath)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
