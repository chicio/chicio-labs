import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { labsCatalogMediaUrl } from "@/lib/content/about-me/open-source-section";

const outputRoot = path.join(process.cwd(), "public", labsCatalogMediaUrl);

function copyLabsCatalogMedia(): void {
    const require = createRequire(path.join(process.cwd(), "package.json"));
    const catalogMedia = path.join(path.dirname(require.resolve("labs-catalog")), "media");

    console.log("🖼️  Copying labs-catalog media...");
    fs.rmSync(outputRoot, { recursive: true, force: true });
    fs.mkdirSync(outputRoot, { recursive: true });
    fs.cpSync(catalogMedia, outputRoot, { recursive: true });

    console.log(`✅ Copied ${fs.readdirSync(outputRoot).length} media files to public${labsCatalogMediaUrl}/`);
}

export { copyLabsCatalogMedia };
