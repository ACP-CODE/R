import type { Avatar } from "./types.ts";

interface GitHubContributor {
    login?: string;
    avatar_url?: string;
    html_url?: string;
    type?: string;
}

/**
 * Fetch repo contributors (real users only — bot accounts are filtered out).
 *
 * Robustness is the entire point of this function: unauthenticated GitHub API
 * requests are capped at 60/hour, and a CI runner sharing an egress IP hits
 * that limit routinely, not as some rare edge case. So every failure path
 * here just warns and returns null — the caller keeps whatever the README
 * already had, instead of letting docs:update exit non-zero.
 *
 * Set GITHUB_TOKEN (or GH_TOKEN) to raise the limit to 5000/hour; GitHub
 * Actions' default secrets.GITHUB_TOKEN is enough.
 */
export async function fetchContributors(owner: string, repo: string): Promise<Avatar[] | null> {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": `${repo}-docs-update-script`,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100&anon=false`,
            {
                headers,
            },
        );

        if (!res.ok) {
            if (res.status === 403 || res.status === 429) {
                console.warn(
                    `⚠️ GitHub API rate-limited (HTTP ${res.status}) — skipping contributors. Set GITHUB_TOKEN to raise the limit.`,
                );
            } else {
                console.warn(`⚠️ Failed to fetch contributors (HTTP ${res.status}) — skipping.`);
            }
            return null;
        }

        const data = (await res.json()) as GitHubContributor[];
        return data
            .filter(
                (c): c is Required<Pick<GitHubContributor, "login" | "avatar_url" | "html_url">> =>
                    c.type === "User" && !!c.login && !!c.avatar_url && !!c.html_url,
            )
            .map((c) => ({ login: c.login, avatarUrl: c.avatar_url, htmlUrl: c.html_url }));
    } catch (err) {
        console.warn(
            `⚠️ Network error fetching contributors — skipping: ${(err as Error).message}`,
        );
        return null;
    }
}
