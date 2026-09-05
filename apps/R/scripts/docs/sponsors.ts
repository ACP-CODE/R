import type { Avatar } from "./types.ts";

interface SponsorshipNode {
    sponsorEntity?: { login?: string; avatarUrl?: string; url?: string };
}

/**
 * GitHub has no public, unauthenticated REST endpoint for "list this user's
 * sponsors" — that data is private by design, only queryable via the
 * GraphQL `sponsorshipsAsMaintainer` field with a token that has permission,
 * and even then only the subset the sponsor opted to make public
 * (`includePrivate: false`).
 *
 * So: no GITHUB_TOKEN means we don't even attempt a request. A token that
 * can't see the data just warns and returns null. Either way the caller
 * falls back to the static `package.json#sponsor.url` link instead of
 * leaving a hole in the README.
 */
export async function fetchGitHubSponsors(login: string): Promise<Avatar[] | null> {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    if (!token) return null;

    const query = `
        query($login: String!) {
            user(login: $login) {
                sponsorshipsAsMaintainer(first: 100, includePrivate: false) {
                    nodes { sponsorEntity { ... on User { login avatarUrl url } ... on Organization { login avatarUrl url } } }
                }
            }
        }
    `;

    try {
        const res = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { login } }),
        });

        if (!res.ok) {
            console.warn(
                `⚠️ Failed to fetch sponsors (HTTP ${res.status}) — falling back to the static sponsor link.`,
            );
            return null;
        }

        const json = (await res.json()) as {
            data?: { user?: { sponsorshipsAsMaintainer?: { nodes?: SponsorshipNode[] } } };
            errors?: unknown[];
        };

        if (json.errors?.length) {
            console.warn(
                "⚠️ Sponsors GraphQL query returned errors — falling back to the static sponsor link.",
                json.errors,
            );
            return null;
        }

        const nodes = json.data?.user?.sponsorshipsAsMaintainer?.nodes ?? [];
        return nodes
            .map((n) => n.sponsorEntity)
            .filter(
                (s): s is Required<Exclude<SponsorshipNode["sponsorEntity"], undefined>> =>
                    !!s?.login && !!s.avatarUrl && !!s.url,
            )
            .map((s) => ({ login: s.login, avatarUrl: s.avatarUrl, htmlUrl: s.url }));
    } catch (err) {
        console.warn(`⚠️ Network error fetching sponsors — skipping: ${(err as Error).message}`);
        return null;
    }
}
