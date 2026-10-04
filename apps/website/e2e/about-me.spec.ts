import { test, expect } from "./fixtures";

test.describe("About me Open Source section", () => {
    test("lists the Lab Projects, then the Standalone Projects, with Matrix Rain once", async ({ page }) => {
        await page.goto("/about-me");

        const names = await page.getByRole("heading", { level: 3 }).allTextContents();

        expect(names.indexOf("Matrix Design System")).toBeGreaterThanOrEqual(0);
        expect(names.indexOf("Matrix Design System")).toBeLessThan(names.indexOf("ID3TagEditor"));
        expect(names.filter((name) => name === "Matrix Rain")).toHaveLength(1);
        expect(names).not.toContain("Matrix Rain WebGPU");
    });

    test("loads the card image of a Lab Project and of a Standalone Project", async ({ page }) => {
        await page.goto("/about-me");

        for (const name of ["Matrix Design System", "ID3TagEditor"]) {
            const image = page.getByRole("img", { name, exact: true }).first();

            await image.scrollIntoViewIfNeeded();
            await expect
                .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth))
                .toBeGreaterThan(0);
        }
    });

    test("links every project outward in a new tab and closes with the Chicio Labs link", async ({ page }) => {
        await page.goto("/about-me");

        const github = page.getByRole("link", { name: "GitHub" }).first();
        await expect(github).toHaveAttribute("target", "_blank");
        await expect(github).toHaveAttribute("rel", "noopener noreferrer");

        const labs = page.getByRole("link", { name: "Every Lab Project → Chicio Labs" });
        await expect(labs).toHaveAttribute("href", "https://labs.fabrizioduroni.it/");
        await expect(labs).toHaveAttribute("target", "_blank");
    });
});
