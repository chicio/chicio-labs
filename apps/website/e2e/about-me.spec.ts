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
            const image = page
                .getByRole("article")
                .filter({ has: page.getByRole("heading", { name, exact: true }) })
                .locator("img");

            await image.scrollIntoViewIfNeeded();
            await expect
                .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth))
                .toBeGreaterThan(0);
        }
    });

    test("leads each card with a terminal button, links the rest outward and closes with the Chicio Labs link", async ({
        page,
    }) => {
        await page.goto("/about-me");

        const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "ID3TagEditor" }) });
        await expect(card.getByRole("link", { name: /^>\s*GitHub/ })).toHaveAttribute(
            "href",
            "https://github.com/chicio/ID3TagEditor",
        );

        const source = page.getByRole("link", { name: "Source ↗" }).first();
        await expect(source).toHaveAttribute("target", "_blank");
        await expect(source).toHaveAttribute("rel", "noopener noreferrer");

        const labs = page.getByRole("link", { name: "Every Lab Project → Chicio Labs" });
        await expect(labs).toHaveAttribute("href", "https://labs.fabrizioduroni.it/");
        await expect(labs).toHaveAttribute("target", "_blank");
    });
});
