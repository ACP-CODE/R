import type { Avatar } from "./types.ts";

export interface AvatarGridOptions {
    columns?: number;
    size?: number;
    gap?: number;
}

/**
 * Render an avatar grid SVG (contrib.rocks-style): each <image> references
 * the avatar URL directly rather than downloading and inlining it, so the
 * file stays tiny and avatars are always current.
 *
 * Each avatar is wrapped in <a xlink:href>, which is clickable when GitHub
 * renders the .svg file directly, or when it's opened standalone in a
 * browser. It is NOT clickable on the VS Code Marketplace, which embeds this
 * file via `<img src="....svg">` — an <img> flattens whatever it points to
 * into a single non-interactive image, so any links inside the SVG are inert
 * there. That's a limitation of <img>, not something fixable here — the
 * caller (index.ts) renders a plain Markdown link list under the image as
 * the clickable fallback for that context.
 */
export function renderAvatarGridSvg(people: Avatar[], opts: AvatarGridOptions = {}): string {
    const columns = opts.columns ?? 10;
    const size = opts.size ?? 48;
    const gap = opts.gap ?? 8;
    const cell = size + gap;
    const rows = Math.max(1, Math.ceil(people.length / columns));
    const usedColumns = people.length === 0 ? 1 : Math.min(columns, people.length);

    const width = usedColumns * cell - gap;
    const height = rows * cell - gap;

    const nodes = people
        .map((person, i) => {
            const col = i % columns;
            const row = Math.floor(i / columns);
            const x = col * cell;
            const y = row * cell;
            const clipId = `avatar-clip-${i}`;
            return `
    <a xlink:href="${escapeXml(person.htmlUrl)}" target="_blank">
        <clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size / 2}" /></clipPath>
        <image x="${x}" y="${y}" width="${size}" height="${size}" href="${escapeXml(person.avatarUrl)}" clip-path="url(#${clipId})">
            <title>${escapeXml(person.login)}</title>
        </image>
    </a>`;
        })
        .join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${nodes}
</svg>
`;
}

function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => {
        switch (c) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            default:
                return "&apos;";
        }
    });
}
