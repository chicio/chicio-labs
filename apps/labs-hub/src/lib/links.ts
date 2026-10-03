import path from "node:path";
import { REPOSITORY_URL } from "./repo";

export const MEDIA_ROUTE = "/docs-media/";

export interface LinkContext {
    /** Repository paths the hub renders as a page, mapped to the page's URL. */
    pages: ReadonlyMap<string, string>;
    isDirectory: (repoPath: string) => boolean;
}

export interface RewrittenLink {
    href: string;
    /** Leaves the hub: it opens in a new tab. */
    external: boolean;
}

const schemePattern = /^([a-z][a-z0-9+.-]*:|\/\/)/i;
const httpPattern = /^https?:\/\//i;
const suffixPattern = /^([^?#]*)([?#].*)?$/;

const splitSuffix = (href: string): { target: string; suffix: string } => {
    const [, target = "", suffix = ""] = suffixPattern.exec(href) ?? [];

    return { target, suffix };
};

const resolveRepoPath = (sourcePath: string, target: string): string =>
    target.startsWith("/")
        ? path.posix.normalize(target.slice(1))
        : path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target));

const escapesRepository = (repoPath: string): boolean => repoPath === ".." || repoPath.startsWith("../");

/**
 * Rewrites a link found in a document of the repository, the way GitHub resolves it, to where it should lead from
 * the hub: a page the hub renders, else the file or folder on GitHub, else (absolute) untouched.
 */
export const rewriteLink = (sourcePath: string, href: string, context: LinkContext): RewrittenLink => {
    if (href === "" || href.startsWith("#")) {
        return { href, external: false };
    }

    if (schemePattern.test(href)) {
        return { href, external: httpPattern.test(href) };
    }

    const { target, suffix } = splitSuffix(href);

    if (target === "") {
        return { href, external: false };
    }

    const repoPath = resolveRepoPath(sourcePath, target).replace(/\/$/, "");

    if (escapesRepository(repoPath)) {
        return { href: new URL(href, `${REPOSITORY_URL}/blob/main/${sourcePath}`).href, external: true };
    }

    const page = context.pages.get(repoPath);

    if (page !== undefined) {
        return { href: `${page}${suffix}`, external: false };
    }

    if (repoPath === "." || repoPath === "") {
        return { href: `${REPOSITORY_URL}${suffix}`, external: true };
    }

    const kind = context.isDirectory(repoPath) ? "tree" : "blob";

    return { href: `${REPOSITORY_URL}/${kind}/main/${repoPath}${suffix}`, external: true };
};

export interface RewrittenImage {
    src: string;
    /** The repository path of an image the hub must serve itself. */
    localPath?: string;
}

/** Remote images stay where they are; a repository file is served by the hub under {@link MEDIA_ROUTE}. */
export const rewriteImage = (sourcePath: string, src: string): RewrittenImage => {
    if (src === "" || schemePattern.test(src)) {
        return { src };
    }

    const { target } = splitSuffix(src);
    const localPath = resolveRepoPath(sourcePath, target);

    if (target === "" || escapesRepository(localPath)) {
        return { src };
    }

    return { src: `${MEDIA_ROUTE}${localPath}`, localPath };
};
