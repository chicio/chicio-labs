import { execSync } from "child_process";
import { generateAndSaveSearchIndex } from "@/lib/content/search";
import { generateAndSaveFilesystemManifest } from "@/lib/build/filesystem-manifest";
import { copyContentMedia } from "@/lib/images/copy-content-media";
import { copyLabsCatalogMedia } from "@/lib/images/copy-labs-catalog-media";

generateAndSaveSearchIndex();
generateAndSaveFilesystemManifest();
copyContentMedia();
copyLabsCatalogMedia();
execSync("serwist build serwist.config.mjs", { stdio: "inherit" });
