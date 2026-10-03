import { describe, expect, it } from "vitest";
import { parseFrontmatterEntry } from "./frontmatter";

describe("frontmatter", () => {
    describe("parseFrontmatterEntry", () => {
        it("reads the name and the description of a skill", () => {
            const source = '---\nname: write-post\ndescription: "Write a Post"\nuser_invocable: true\n---\n# Body';

            expect(parseFrontmatterEntry(source, "fallback")).toEqual({
                name: "write-post",
                description: "Write a Post",
            });
        });

        it("prefers the short summary of an agent over its long description", () => {
            const source =
                '---\nname: "explorer"\nsummary: "Read-only explorer"\ndescription: "Use this agent to ..."\n---';

            expect(parseFrontmatterEntry(source, "fallback").description).toBe("Read-only explorer");
        });

        it("cuts an overlong description at a word boundary", () => {
            const source = `---\nname: long\ndescription: ${"word ".repeat(100)}\n---`;
            const { description } = parseFrontmatterEntry(source, "fallback");

            expect(description.length).toBeLessThanOrEqual(244);
            expect(description.endsWith("...")).toBe(true);
            expect(description).not.toContain("wor...");
        });

        it("flattens the newlines of a multi-line description", () => {
            const source = '---\nname: multi\ndescription: "first\\nsecond"\n---';

            expect(parseFrontmatterEntry(source, "fallback").description).toBe("first second");
        });

        it("falls back to the file name and an empty description without frontmatter", () => {
            expect(parseFrontmatterEntry("# Just a body", "writer")).toEqual({ name: "writer", description: "" });
        });

        it("falls back when the frontmatter is empty", () => {
            expect(parseFrontmatterEntry("---\n\n---\nbody", "writer").name).toBe("writer");
        });
    });
});
