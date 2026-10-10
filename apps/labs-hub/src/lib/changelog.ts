export interface ChangelogEntry {
    scope?: string;
    message: string;
    /** The short commit hash; absent on a breaking change, which conventional-changelog lists without one. */
    commit?: string;
    commitUrl?: string;
}

export interface ChangelogGroup {
    title: string;
    entries: ChangelogEntry[];
}

export interface ChangelogRelease {
    version: string;
    /** `YYYY-MM-DD`, as written in the CHANGELOG. */
    date?: string;
    compareUrl?: string;
    groups: ChangelogGroup[];
}

export interface ParseOptions {
    /** Maps a link found in the CHANGELOG to where it should lead (the hub resolves its `///` links this way). */
    resolveUrl?: (href: string) => string;
}

const releaseHeadingPattern = /^##\s+(?:\[([^\]]+)\]\(([^)]*)\)|(\S+))\s*(?:\((\d{4}-\d{2}-\d{2})\))?\s*$/;
const groupHeadingPattern = /^###\s+(.+?)\s*$/;
const releaseDatePattern = /^Release date:\s*(\d{4}-\d{2}-\d{2})/;
const entryPattern = /^[*-]\s+(.+)$/;
const scopePattern = /^\*\*([^*]+?):?\*\*\s*/;
const trailerPattern = /,\s*(?:closes|references)\s.*$/;
const linkedCommitPattern = /\s*\(\[([0-9a-f]{7,40})\]\(([^)]*)\)\)\s*$/;
const bareCommitPattern = /\s+((?=[0-9a-f]*\d)[0-9a-f]{7,40})\s*$/;
const referencePattern = /(?:\s*\(?\[#[^\]]*\]\([^)]*\)\)?)+\s*$/;
const shortcodePattern = /:[a-z0-9_+-]+:/g;
const leadingEmojiPattern = /^[\p{Extended_Pictographic}\u{FE0F}\u{200D}\s]+/u;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `2026-09-11` becomes `11 Sep 2026`. Anything that is not an ISO date is returned untouched. */
export const formatReleaseDate = (date: string): string => {
    const [, year, month, day] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) ?? [];
    const name = months[Number(month) - 1];

    return year === undefined || day === undefined || name === undefined ? date : `${day} ${name} ${year}`;
};

/** What the link of a release says: a diff against the previous release, or the release itself. */
export const releaseLinkLabel = (compareUrl: string): string =>
    compareUrl.includes("/compare/") ? "compare" : "release";

const cleanMessage = (text: string): string =>
    text.replace(shortcodePattern, "").replace(leadingEmojiPattern, "").replace(/\s+/g, " ").trim();

const parseEntry = (line: string, repository: string | undefined, resolveUrl: (href: string) => string) => {
    let text = line;
    let scope: string | undefined;
    let commit: string | undefined;
    let commitUrl: string | undefined;

    const scoped = scopePattern.exec(text);

    if (scoped) {
        scope = scoped[1]?.trim();
        text = text.slice(scoped[0].length);
    }

    text = text.replace(shortcodePattern, "").replace(trailerPattern, "");

    const linked = linkedCommitPattern.exec(text);
    const bare = linked ? null : bareCommitPattern.exec(text);

    if (linked) {
        commit = linked[1];
        commitUrl = resolveUrl(linked[2] ?? "");
        text = text.slice(0, linked.index);
    } else if (bare) {
        commit = bare[1];
        commitUrl = repository && `${repository}/commit/${commit}`;
        text = text.slice(0, bare.index);
    }

    text = text.replace(referencePattern, "");

    return { scope, message: cleanMessage(text), commit, commitUrl };
};

/**
 * Reads a conventional-changelog CHANGELOG into releases, newest first as written, each with its groups of entries.
 * A release with no group is a release with nothing notable; a document with no release heading yields none, so the
 * caller can fall back to rendering the Markdown as it is.
 */
export const parseChangelog = (markdown: string, options: ParseOptions = {}): ChangelogRelease[] => {
    const resolveUrl = options.resolveUrl ?? ((href: string) => href);
    const releases: ChangelogRelease[] = [];
    let release: ChangelogRelease | undefined;
    let group: ChangelogGroup | undefined;
    let repository: string | undefined;

    for (const line of markdown.split("\n")) {
        const heading = releaseHeadingPattern.exec(line);

        if (heading) {
            const compareUrl = heading[2] === undefined || heading[2] === "" ? undefined : resolveUrl(heading[2]);

            release = { version: heading[1] ?? heading[3] ?? "", date: heading[4], compareUrl, groups: [] };
            releases.push(release);
            group = undefined;
            repository = compareUrl?.includes("/compare/") ? compareUrl.split("/compare/")[0] : undefined;
            continue;
        }

        if (!release) {
            continue;
        }

        const releaseDate = releaseDatePattern.exec(line);

        if (releaseDate && release.date === undefined) {
            release.date = releaseDate[1];
            continue;
        }

        const groupHeading = groupHeadingPattern.exec(line);

        if (groupHeading) {
            group = { title: groupHeading[1] ?? "", entries: [] };
            release.groups.push(group);
            continue;
        }

        const entry = entryPattern.exec(line);

        if (entry && group) {
            group.entries.push(parseEntry(entry[1] ?? "", repository, resolveUrl));
        }
    }

    return releases;
};
