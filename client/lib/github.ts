export interface RepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface RepoInfo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  size: number;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  created_at: string;
  license: { name: string; spdx_id: string } | null;
  owner: RepoOwner;
  topics?: string[];
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface RepoAnalysis {
  repo: RepoInfo;
  languages: Record<string, number>;
  contributors: Contributor[];
  tree: TreeEntry[];
  truncated: boolean;
  packageJson: PackageJson | null;
  readme: string | null;
}

export class GithubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ParsedRepoRef {
  owner: string;
  repo: string;
}

export interface PullRequestImpact {
  number: number;
  title: string;
  state: string;
  author: string;
  html_url: string;
  additions: number;
  deletions: number;
  changed_files: number;
  files: string[];
}

export function parsePullRequestInput(input: string): { number: number } | null {
  const match = input.trim().match(/(?:\/pull\/|#)(\d+)\/?$/i);
  return match ? { number: Number(match[1]) } : null;
}

export function parseRepoInput(input: string): ParsedRepoRef | null {
  const trimmed = input.trim().replace(/\.git$/, "");
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)\/?$/i,
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  const shorthandMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  }

  return null;
}

async function ghFetch(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new GithubApiError("Repository not found or is private.", 404);
    }
    if (res.status === 403) {
      throw new GithubApiError(
        "GitHub API rate limit reached. Please try again in a few minutes.",
        403,
      );
    }
    throw new GithubApiError(`GitHub API error (${res.status}).`, res.status);
  }
  return res.json();
}

export async function fetchPullRequestImpact(owner: string, repo: string, number: number): Promise<PullRequestImpact> {
  const base = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
  const [pull, files] = await Promise.all([ghFetch(base), ghFetch(`${base}/files?per_page=100`)]);
  return {
    number: pull.number,
    title: pull.title,
    state: pull.merged_at ? "merged" : pull.state,
    author: pull.user?.login ?? "unknown",
    html_url: pull.html_url,
    additions: pull.additions ?? 0,
    deletions: pull.deletions ?? 0,
    changed_files: pull.changed_files ?? 0,
    files: Array.isArray(files) ? files.map((file: { filename: string }) => file.filename) : [],
  };
}

export async function fetchRepoAnalysis(
  owner: string,
  repo: string,
): Promise<RepoAnalysis> {
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const repoInfo: RepoInfo = await ghFetch(base);

  const [languages, contributors, treeData] = await Promise.all([
    ghFetch(`${base}/languages`).catch(() => ({})),
    ghFetch(`${base}/contributors?per_page=10`).catch(() => []),
    ghFetch(
      `${base}/git/trees/${repoInfo.default_branch}?recursive=1`,
    ).catch(() => ({ tree: [], truncated: false })),
  ]);

  let packageJson: PackageJson | null = null;
  let readme: string | null = null;
  try {
    const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${repoInfo.default_branch}/README.md`);
    if (readmeRes.ok) readme = await readmeRes.text();
  } catch {
    readme = null;
  }
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${repoInfo.default_branch}/package.json`,
    );
    if (res.ok) {
      packageJson = await res.json();
    }
  } catch {
    packageJson = null;
  }

  return {
    repo: repoInfo,
    languages,
    contributors: Array.isArray(contributors) ? contributors : [],
    tree: Array.isArray(treeData.tree) ? treeData.tree : [],
    truncated: Boolean(treeData.truncated),
    packageJson,
    readme,
  };
}

export interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  size?: number;
  children: TreeNode[];
}

export function buildFileTree(entries: TreeEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));

  for (const entry of sorted) {
    const parts = entry.path.split("/");
    let currentPath = "";
    let siblings = root;

    parts.forEach((part, idx) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = idx === parts.length - 1;
      let node = map.get(currentPath);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isLeaf ? entry.type : "tree",
          size: isLeaf ? entry.size : undefined,
          children: [],
        };
        map.set(currentPath, node);
        siblings.push(node);
      }
      siblings = node.children;
    });
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(root);

  return root;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mo ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} yr ago`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
  Makefile: "#427819",
};

export function getLanguageColor(lang: string, index: number): string {
  if (LANGUAGE_COLORS[lang]) return LANGUAGE_COLORS[lang];
  const fallback = ["#8B5CF6", "#22D3EE", "#F472B6", "#34D399", "#FBBF24"];
  return fallback[index % fallback.length];
}

export function summarizeReadme(readme: string | null, fallback: string | null): string {
  const description = fallback?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (description) return description;
  if (!readme) return "No repository summary was provided.";

  const cleaned = readme
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/https?:\/\/\S+/g, "")
    .split("\n")
    .filter((line) => line.trim() && !/run and deploy|view your app in ai studio|built with google ai studio/i.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = cleaned.match(/^(.{60,420}?[.!?])(?:\s|$)/)?.[1];
  return sentence || cleaned.slice(0, 320) || "No repository summary was provided.";
}

export function generateMarkdownReport(analysis: RepoAnalysis): string {
  const { repo, languages, contributors, tree, packageJson } = analysis;
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const fileCount = tree.filter((t) => t.type === "blob").length;
  const dirCount = tree.filter((t) => t.type === "tree").length;

  const langLines = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([lang, bytes]) =>
        `- **${lang}**: ${((bytes / totalBytes) * 100).toFixed(1)}%`,
    )
    .join("\n");

  const contributorLines = contributors
    .slice(0, 10)
    .map((c) => `- [${c.login}](${c.html_url}) — ${c.contributions} commits`)
    .join("\n");

  const largestFiles = tree
    .filter((t) => t.type === "blob" && t.size)
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    .slice(0, 10)
    .map((f) => `- \`${f.path}\` — ${formatBytes(f.size ?? 0)}`)
    .join("\n");

  const summary = summarizeReadme(analysis.readme, repo.description);
  const deps = packageJson?.dependencies
    ? Object.entries(packageJson.dependencies)
        .map(([name, version]) => `- \`${name}\`: ${version}`)
        .join("\n")
    : "_No package.json dependencies detected._";

  return `# RepoLens Report — ${repo.full_name}

Generated by RepoLens • ${new Date().toISOString().split("T")[0]}

## Summary
${summary}

## Overview
- **Description**: ${repo.description ?? "—"}
- **Stars**: ${repo.stargazers_count}
- **Forks**: ${repo.forks_count}
- **Open Issues**: ${repo.open_issues_count}
- **Primary Language**: ${repo.language ?? "—"}
- **Size**: ${formatBytes(repo.size * 1024)}
- **License**: ${repo.license?.name ?? "—"}
- **Last Updated**: ${repo.updated_at}
- **Files**: ${fileCount} · **Directories**: ${dirCount}

## Language Breakdown
${langLines || "_Not available._"}

## Top Contributors
${contributorLines || "_Not available._"}

## Largest Files
${largestFiles || "_Not available._"}

## Dependencies (package.json)
${deps}

---
Report generated by RepoLens — understand any GitHub repository in under 60 seconds.
`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
