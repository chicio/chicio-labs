import { test, expect } from "./fixtures";

test.describe("Homepage and primary navigation", () => {
    test("homepage loads and displays the site title", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Fabrizio Duroni/i);
        await expect(page.locator("body")).toBeVisible();
    });

    test("homepage contains a menu with navigation links", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: /blog/i }).first()).toBeVisible();
    });

    test("the Blog nav dropdown lists Latest posts, Authors, Tags and Archive", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Blog" }).first().click();
        const menu = page.getByRole("list", { name: "Blog" }).first();
        await expect(menu.getByRole("link", { name: "Latest posts" })).toHaveAttribute("href", "/blog");
        await expect(menu.getByRole("link", { name: "Authors" })).toHaveAttribute("href", "/blog/authors");
        await expect(menu.getByRole("link", { name: "Tags" })).toHaveAttribute("href", "/blog/tags");
        await expect(menu.getByRole("link", { name: "Archive" })).toHaveAttribute("href", "/blog/archive");
    });

    test("the Author nav dropdown lists the hobbies Art, Manga and Videogames", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "The Author" }).first().click();
        const hobbies = page
            .getByRole("list", { name: "The Author" })
            .first()
            .getByRole("list", { name: "Hobbies" })
            .getByRole("link");
        await expect(hobbies).toHaveText(["Art", "Manga", "Videogames"]);
        await expect(hobbies.nth(1)).toHaveAttribute("href", "/manga");
    });

    test("the Author nav dropdown lists the Lab group with a Chicio Labs link opening the Labs Hub in a new tab", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "The Author" }).first().click();
        const lab = page.getByRole("list", { name: "The Author" }).first().getByRole("list", { name: "Lab" });
        const link = lab.getByRole("link", { name: "Chicio Labs" });
        await expect(link).toHaveAttribute("href", "https://labs.fabrizioduroni.it/");
        await expect(link).toHaveAttribute("target", "_blank");
    });

    test("the chat page keeps the menu with the Manga hobby entry", async ({ page }) => {
        await page.goto("/chat");
        await page.getByRole("button", { name: "The Author" }).first().click();
        const hobbies = page.getByRole("list", { name: "The Author" }).first().getByRole("list", { name: "Hobbies" });
        await expect(hobbies.getByRole("link", { name: "Manga" })).toHaveAttribute("href", "/manga");
    });

    test("the Manga menu link opens the manga collection", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "The Author" }).first().click();
        await page.getByRole("list", { name: "The Author" }).first().getByRole("link", { name: "Manga" }).click();
        await expect(page).toHaveURL(/\/manga$/);
    });

    test("the Blog dropdown stays highlighted on an author page, but not on an unrelated page", async ({ page }) => {
        await page.goto("/blog/author/antonino-gitto");
        const blogButton = page.getByRole("button", { name: "Blog" }).first();
        await expect(blogButton).toHaveClass(/bg-accent-alpha-15/);

        await page.goto("/about-me");
        await expect(page.getByRole("button", { name: "Blog" }).first()).not.toHaveClass(/bg-accent-alpha-15/);
    });

    test("the footer links to Home, Blog, Art, About Me, Archive and Tags", async ({ page }) => {
        await page.goto("/about-me");
        const footerLinks = page.getByRole("contentinfo").getByRole("link");
        await expect(footerLinks.filter({ hasText: /^(Home|Blog|Art|About Me|Archive|Tags)$/ })).toHaveText([
            "Home",
            "Blog",
            "Art",
            "About Me",
            "Archive",
            "Tags",
        ]);
    });

    test("all three header dropdown panels share the same fixed 240px width", async ({ page }) => {
        await page.goto("/");

        await page.getByRole("button", { name: "Blog" }).first().click();
        const blogBox = await page.getByRole("list", { name: "Blog" }).first().boundingBox();
        await page.getByRole("button", { name: "Blog" }).first().click();

        await page.getByRole("button", { name: "Explore" }).first().click();
        const exploreBox = await page.getByRole("list", { name: "Explore" }).first().boundingBox();
        await page.getByRole("button", { name: "Explore" }).first().click();

        await page.getByRole("button", { name: "The Author" }).first().click();
        const authorBox = await page.getByRole("list", { name: "The Author" }).first().boundingBox();
        await page.getByRole("button", { name: "The Author" }).first().click();

        expect(blogBox?.width).toBe(240);
        expect(exploreBox?.width).toBe(240);
        expect(authorBox?.width).toBe(240);
    });

    test("no group header wraps onto a second line inside the 240px Explore panel", async ({ page }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Explore" }).first().click();
        const panel = page.getByRole("list", { name: "Explore" }).first();
        const dsaHeaderBox = await panel.getByText("DSA", { exact: true }).boundingBox();
        const aiHeaderBox = await panel.getByText("Artificial Intelligence", { exact: true }).boundingBox();
        expect(dsaHeaderBox).not.toBeNull();
        expect(aiHeaderBox).not.toBeNull();
        expect(Math.abs((aiHeaderBox?.height ?? 0) - (dsaHeaderBox?.height ?? 0))).toBeLessThan(2);
    });

    test("the mobile dropdown panel stays 320px wide, unaffected by the desktop fixed width", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto("/");
        await page.locator("svg.size-9").click();
        await page.getByRole("button", { name: "Blog" }).first().click();
        const mobilePanelBox = await page.getByRole("list", { name: "Blog" }).first().boundingBox();
        expect(mobilePanelBox?.width).toBe(320);
    });

    test("navigating to /blog loads the blog listing page", async ({ page }) => {
        await page.goto("/");
        await page.goto("/blog");
        await expect(page).toHaveURL(/\/blog/);
        await expect(page.locator("body")).toBeVisible();
    });

    test("navigating to /about-me loads the about page", async ({ page }) => {
        await page.goto("/about-me");
        await expect(page).toHaveURL(/\/about-me/);
        await expect(page.locator("body")).toBeVisible();
    });

    test("page returns HTTP 200 for the homepage", async ({ page }) => {
        const response = await page.goto("/");
        expect(response?.status()).toBe(200);
    });
});
