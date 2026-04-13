import "./load-env";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseServerClient } from "../lib/supabase";
import { splitIntoChunks } from "../lib/chunk";
import { fetchReadme, fetchRepos, type GitHubRepo } from "../lib/github";
import { env } from "../lib/env";

const SELECTED_REPOS_PATH = path.join(process.cwd(), "data", "repos", "selected-repos.json");

function summarizeRepo(repo: {
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  homepage?: string | null;
  updated_at: string;
}) {
  const parts = [
    `Repository: ${repo.name}`,
    repo.description ? `Description: ${repo.description}` : null,
    repo.language ? `Primary language: ${repo.language}` : null,
    repo.topics?.length ? `Topics: ${repo.topics.join(", ")}` : null,
    repo.homepage ? `Homepage: ${repo.homepage}` : null,
    `Last updated: ${repo.updated_at}`
  ];

  return parts.filter(Boolean).join("\n");
}

async function main() {
  if (!env.GITHUB_USERNAME) {
    throw new Error("GITHUB_USERNAME is missing in .env.local.");
  }

  const repos = await fetchRepos(env.GITHUB_USERNAME, env.GITHUB_TOKEN);
  const selectedRepoNames = JSON.parse(
    await readFile(SELECTED_REPOS_PATH, "utf8")
  ) as string[];
  const selectedRepos = selectedRepoNames
    .map((name) => repos.find((repo) => repo.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean) as GitHubRepo[];

  if (!selectedRepos.length) {
    throw new Error(
      "No selected repos matched your GitHub profile. Update data/repos/selected-repos.json."
    );
  }
  const supabase = getSupabaseServerClient();

  await supabase.from("knowledge_chunks").delete().eq("source_type", "repo");
  await supabase.from("repos").delete().neq("name", "");

  const repoRows: {
    name: string;
    url: string;
    description: string | null;
    languages: string[];
    readme_summary: string | null;
    tradeoffs: string | null;
    last_synced_at: string;
  }[] = [];
  const chunkRows: {
    source_type: "repo";
    source_name: string;
    url: string;
    chunk_text: string;
    metadata_json: {
      chunkIndex: number;
      language: string | null;
      updatedAt: string;
    };
  }[] = [];

  for (const repo of selectedRepos) {
    const readme = await fetchReadme(env.GITHUB_USERNAME, repo.name, env.GITHUB_TOKEN);
    const sourceText = [summarizeRepo(repo), readme].filter(Boolean).join("\n\n");
    const chunks = splitIntoChunks(sourceText);

    repoRows.push({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      languages: repo.language ? [repo.language] : [],
      readme_summary: readme.slice(0, 1200) || null,
      tradeoffs: null,
      last_synced_at: new Date().toISOString()
    });

    chunks.forEach((chunk, index) => {
      chunkRows.push({
        source_type: "repo",
        source_name: repo.name,
        url: repo.html_url,
        chunk_text: chunk,
        metadata_json: {
          chunkIndex: index,
          language: repo.language,
          updatedAt: repo.updated_at
        }
      });
    });
  }

  const repoInsert = await supabase.from("repos").insert(repoRows);

  if (repoInsert.error) {
    throw repoInsert.error;
  }

  const chunkInsert = await supabase.from("knowledge_chunks").insert(chunkRows);

  if (chunkInsert.error) {
    throw chunkInsert.error;
  }

  console.log(
    `Inserted ${repoRows.length} repos and ${chunkRows.length} knowledge chunks for ${env.GITHUB_USERNAME}.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
