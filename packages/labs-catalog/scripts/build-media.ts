import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { labProjects, standaloneProjects } from "../src/catalog";
import { mediaCopies } from "../src/images";
import { validateCatalog } from "../src/validate";

const packageRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(packageRoot, "../..");
const catalog = { labProjects, standaloneProjects };

const errors = validateCatalog(catalog, (repoPath) => existsSync(path.join(repositoryRoot, repoPath)));

if (errors.length > 0) {
    console.error(`labs-catalog: the catalog is not sound:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
    process.exit(1);
}

const mediaDirectory = path.join(packageRoot, "dist/media");

rmSync(mediaDirectory, { recursive: true, force: true });
mkdirSync(mediaDirectory, { recursive: true });

for (const { from, to } of mediaCopies(catalog)) {
    copyFileSync(path.join(repositoryRoot, from), path.join(packageRoot, "dist", to));
}
