type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  homepage?: string | null;
  updated_at: string;
};

function getHeaders(token?: string) {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchRepos(username: string, token?: string) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers: getHeaders(token), cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`GitHub repo fetch failed: ${response.status}`);
  }

  const repos = (await response.json()) as GitHubRepo[];
  return repos.filter((repo) => !repo.name.startsWith("."));
}

export async function fetchReadme(owner: string, repo: string, token?: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers: getHeaders(token), cache: "no-store" }
  );

  if (response.status === 404) {
    return "";
  }

  if (!response.ok) {
    throw new Error(`GitHub README fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { content?: string; encoding?: string };

  if (!payload.content) {
    return "";
  }

  if (payload.encoding === "base64") {
    return Buffer.from(payload.content, "base64").toString("utf8");
  }

  return payload.content;
}

export type { GitHubRepo };
