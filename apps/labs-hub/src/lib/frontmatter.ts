import { parse } from "yaml";

export interface FrontmatterEntry {
    name: string;
    description: string;
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---/;
const maximumDescriptionLength = 240;

const shorten = (text: string): string => {
    const flattened = text.replace(/\s+/g, " ").trim();

    if (flattened.length <= maximumDescriptionLength) {
        return flattened;
    }

    return `${flattened.slice(0, maximumDescriptionLength).replace(/\s+\S*$/, "")}...`;
};

/**
 * Reads the YAML frontmatter of an agent or a skill. Agents carry a short `summary` and a long `description` meant
 * for the model, skills only a `description`: the summary wins, and an overlong description is cut.
 */
export const parseFrontmatterEntry = (source: string, fallbackName: string): FrontmatterEntry => {
    const match = frontmatterPattern.exec(source);
    const data = (match ? parse(match[1] ?? "") : {}) as Record<string, unknown> | null;
    const read = (key: string): string | undefined => {
        const value = data?.[key];

        return typeof value === "string" && value.trim() !== "" ? value : undefined;
    };

    return {
        name: read("name") ?? fallbackName,
        description: shorten(read("summary") ?? read("description") ?? ""),
    };
};
