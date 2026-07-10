/**
 * GitHub REST API Integration Utility
 * Allows Vercel serverless functions to directly commit and delete Markdown posts in the repository.
 * Keeps the static Markdown database fully synchronized in production.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "Maaef";
const GITHUB_REPO = process.env.GITHUB_REPO || "Maaef-Shift-To-React";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

/**
 * Checks if GitHub REST API credentials are fully configured in the environment.
 */
export function isGithubConfigured(): boolean {
  return !!GITHUB_TOKEN;
}

/**
 * Fetches file details from GitHub to retrieve its SHA (required for updating or deleting files).
 * Returns null if the file does not exist.
 */
async function getGithubFileSha(filePath: string): Promise<string | null> {
  if (!isGithubConfigured()) return null;

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Maaef-Serverless-Assistant"
      },
      next: { revalidate: 0 } // Bypass Next.js cache
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GitHub API GET failed: ${res.status} - ${errorText}`);
      return null;
    }

    const data = await res.json();
    return data.sha || null;
  } catch (error) {
    console.error("Error fetching file SHA from GitHub:", error);
    return null;
  }
}

/**
 * Commits or updates a file directly in the GitHub repository.
 * Returns true if successful, false otherwise.
 */
export async function commitFileToGithub(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<boolean> {
  if (!isGithubConfigured()) {
    console.error("GitHub integration failed: GITHUB_TOKEN is not defined in environment variables.");
    return false;
  }

  // 1. Fetch the existing file SHA if it exists (necessary for updates)
  const existingSha = await getGithubFileSha(filePath);

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  
  // 2. Base64 encode the markdown content
  const base64Content = Buffer.from(content, "utf-8").toString("base64");

  const payload: any = {
    message: commitMessage,
    content: base64Content,
    branch: GITHUB_BRANCH
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Maaef-Serverless-Assistant"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GitHub API PUT failed: ${res.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error committing file to GitHub:", error);
    return false;
  }
}

/**
 * Deletes a file directly from the GitHub repository.
 * Returns true if successful, false otherwise.
 */
export async function deleteFileFromGithub(
  filePath: string,
  commitMessage: string
): Promise<boolean> {
  if (!isGithubConfigured()) {
    console.error("GitHub integration failed: GITHUB_TOKEN is not defined in environment variables.");
    return false;
  }

  // 1. Fetch the file SHA (mandatory to delete files via GitHub API)
  const existingSha = await getGithubFileSha(filePath);
  if (!existingSha) {
    // If it doesn't exist on GitHub, we consider deletion completed successfully
    return true;
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  const payload = {
    message: commitMessage,
    sha: existingSha,
    branch: GITHUB_BRANCH
  };

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Maaef-Serverless-Assistant"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GitHub API DELETE failed: ${res.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file from GitHub:", error);
    return false;
  }
}

/**
 * Commits or updates a binary file directly in the GitHub repository.
 * Returns true if successful, false otherwise.
 */
export async function commitBinaryFileToGithub(
  filePath: string,
  buffer: Buffer,
  commitMessage: string
): Promise<boolean> {
  if (!isGithubConfigured()) {
    console.error("GitHub integration failed: GITHUB_TOKEN is not defined in environment variables.");
    return false;
  }

  // 1. Fetch the existing file SHA if it exists (necessary for updates)
  const existingSha = await getGithubFileSha(filePath);

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  
  // 2. Base64 encode the binary buffer
  const base64Content = buffer.toString("base64");

  const payload: any = {
    message: commitMessage,
    content: base64Content,
    branch: GITHUB_BRANCH
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Maaef-Serverless-Assistant"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GitHub API PUT binary failed: ${res.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error committing binary file to GitHub:", error);
    return false;
  }
}

