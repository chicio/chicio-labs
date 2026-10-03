import { readFileSync } from "node:fs";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";
import { loadHubContent } from "../../lib/content";
import { findRepoRoot } from "../../lib/repo";

const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
};

export const getStaticPaths: GetStaticPaths = async () => {
    const { mediaPaths } = await loadHubContent();

    return mediaPaths.map((mediaPath) => ({ params: { path: mediaPath } }));
};

/** Serves an image a rendered document embeds, straight from the repository, so the docs stay the one source. */
export const GET: APIRoute = ({ params }) => {
    const mediaPath = params.path ?? "";
    const body = readFileSync(path.join(findRepoRoot(), mediaPath));

    return new Response(body, {
        headers: { "Content-Type": contentTypes[path.extname(mediaPath).toLowerCase()] ?? "application/octet-stream" },
    });
};
