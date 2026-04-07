import { execFileSync } from "node:child_process";

export const GITHUB_CONNECTION =
  process.env.AUTH0_GITHUB_CONNECTION || "github";

export type GitHubIssueTarget = {
  owner: string;
  repo: string;
  source: "env" | "git_remote";
};

export type GitHubIssueResult = {
  number: number;
  htmlUrl: string;
  title: string;
};

export class GitHubIssueCreateError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`GitHub issue create failed with ${status}: ${body}`);
    this.name = "GitHubIssueCreateError";
    this.status = status;
    this.body = body;
  }
}

function parseGitHubTarget(input: string) {
  const trimmed = input.trim();
  const remoteMatch = trimmed.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/i);

  if (remoteMatch) {
    return {
      owner: remoteMatch[1],
      repo: remoteMatch[2]
    };
  }

  const directMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (directMatch) {
    return {
      owner: directMatch[1],
      repo: directMatch[2]
    };
  }

  throw new Error(
    `Unable to resolve a GitHub owner/repo target from "${trimmed}".`
  );
}

export function resolveGitHubIssueTarget(): GitHubIssueTarget {
  const configuredTarget = process.env.GITHUB_TARGET_REPO?.trim();
  if (configuredTarget) {
    return {
      ...parseGitHubTarget(configuredTarget),
      source: "env"
    };
  }

  const remoteUrl = execFileSync(
    "git",
    ["config", "--get", "remote.origin.url"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  ).trim();

  if (!remoteUrl) {
    throw new Error(
      "Unable to resolve the GitHub target repo from remote.origin.url."
    );
  }

  return {
    ...parseGitHubTarget(remoteUrl),
    source: "git_remote"
  };
}

export async function createGitHubIssue(
  accessToken: string,
  target: GitHubIssueTarget,
  title: string,
  body: string
): Promise<GitHubIssueResult> {
  const response = await fetch(
    `https://api.github.com/repos/${target.owner}/${target.repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "GateKeeper-Layer2-Yellow-Lane",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        title,
        body
      })
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new GitHubIssueCreateError(response.status, responseText);
  }

  const payload = responseText
    ? (JSON.parse(responseText) as {
        html_url?: string;
        number?: number;
        title?: string;
      })
    : {};

  return {
    htmlUrl: payload.html_url || "",
    number: payload.number ?? 0,
    title: payload.title || title
  };
}
