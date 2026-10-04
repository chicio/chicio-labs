/// <reference types="astro/client" />
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

/**
 * Every card image `labs-catalog` gathered into its `dist/media/`. One glob over the folder: a new project's image
 * needs no entry here, because the catalog's build is what puts it there. The keys Vite returns are resolved to the
 * `media/<file>` paths the catalog hands out.
 */
const catalogImages = import.meta.glob<ImageMetadata>("../../../../packages/labs-catalog/dist/media/*", {
    eager: true,
    import: "default",
});

const imagesByPath = new Map(
    Object.entries(catalogImages).map(([key, image]) => [`media/${key.slice(key.lastIndexOf("/") + 1)}`, image]),
);

/** The optimized (webp) URL of a card image, named by the path `labs-catalog` serves it from. */
export const optimizedCardImage = async (cardImage: string, width = 1000): Promise<string> => {
    const source = imagesByPath.get(cardImage);

    if (!source) {
        throw new Error(`The card image ${cardImage} is not in labs-catalog's dist/media: build the package first`);
    }

    return (await getImage({ src: source, width, format: "webp" })).src;
};
