import { defineConfig } from "tsdown";

// Never run this in watch mode: `clean` empties dist/ and the dist/media step lives in `npm run build`, not here.
export default defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    dts: true,
    clean: true,
});
