import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const REPOSITORY_URL = "https://github.com/chicio/chicio-labs";
export const HUB_URL = "https://labs.fabrizioduroni.it";
export const WEBSITE_URL = "https://www.fabrizioduroni.it";

/**
 * Walks up from `start` to the repository root: the first directory whose package.json declares workspaces.
 * The Astro build bundles `src/lib`, so `import.meta.url` cannot locate the repository; the working directory
 * (the hub's own folder under turbo and under `npm run build --workspace`) always can.
 */
export const findRepoRoot = (start: string = process.cwd()): string => {
    let directory = path.resolve(start);

    for (;;) {
        const manifest = path.join(directory, "package.json");

        if (existsSync(manifest) && "workspaces" in JSON.parse(readFileSync(manifest, "utf8"))) {
            return directory;
        }

        const parent = path.dirname(directory);

        if (parent === directory) {
            throw new Error(`No repository root (a package.json with workspaces) found above ${start}`);
        }

        directory = parent;
    }
};

export const readRepoFile = (root: string, repoPath: string): string => readFileSync(path.join(root, repoPath), "utf8");

export const readRepoJson = <T>(root: string, repoPath: string): T => JSON.parse(readRepoFile(root, repoPath)) as T;

export const repoFileExists = (root: string, repoPath: string): boolean => existsSync(path.join(root, repoPath));

export const isRepoDirectory = (root: string, repoPath: string): boolean => {
    const absolute = path.join(root, repoPath);

    return existsSync(absolute) && statSync(absolute).isDirectory();
};

export const listRepoDirectory = (root: string, repoPath: string): string[] => {
    const absolute = path.join(root, repoPath);

    return existsSync(absolute) ? readdirSync(absolute).sort() : [];
};
