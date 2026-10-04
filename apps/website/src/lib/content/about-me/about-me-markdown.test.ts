import { describe, it, expect } from "vitest";
import { aboutMeMarkdown } from "./about-me-markdown";
import { openSourceProjects } from "./open-source-projects";

describe("aboutMeMarkdown", () => {
    it("renders a document for the About me page", () => {
        expect(aboutMeMarkdown({})).toContain("## Biography");
    });

    it("lists every open source project instead of an interactive placeholder", () => {
        const result = aboutMeMarkdown({})!;

        expect(result).not.toContain("[interactive: Projects");
        openSourceProjects().forEach((project) => {
            expect(result).toContain(`**${project.name}**`);
        });
    });

    it("lists the open source projects under the Open Source heading, at the end of the page", () => {
        const result = aboutMeMarkdown({})!;

        expect(result.indexOf("## Open Source")).toBeLessThan(result.indexOf(`**${openSourceProjects()[0].name}**`));
        expect(result.trim().endsWith("(https://labs.fabrizioduroni.it/)")).toBe(true);
    });

    it("lists Matrix Rain once", () => {
        expect(aboutMeMarkdown({})!.match(/\*\*Matrix Rain\*\*/g)).toHaveLength(1);
    });
});
