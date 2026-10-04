import { describe, expect, mock, test } from "claude-code/testing";

import { bmpBase64, pngHead } from "./test-fixtures";

const BAND = {
    plugin: "image-peek",
    component: "AbovePrompt",
    surface: "terminal",
    requestId: "above-prompt",
    viewport: { columns: 120, rows: 40 },
    props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 4,
        bodyColumns: 120,
        scroll: { offset: 0, bodyRows: 4 },
        view: {},
    },
} as const;

const DIR = "/tmp/claude-501/-work/sess-1/images";
const ENTRY = { size: 0, mtimeMs: 0, isLink: false };

describe("image-peek", () => {
    test("draws a pasted image with quadrant blocks in Warp, and its button opens Quick Look", async ($, on) => {
        const clock = mock.clock(on);
        const runs: string[][] = [];
        const env: Record<string, string> = { CLAUDE_CODE_TMPDIR: "/tmp/claude-501", TERM_PROGRAM: "WarpTerminal" };
        const draft = "see [Image #1] [Image #2]";
        on("session.start", () => ({ cwd: "/work" }));
        on("prompt.read", () => ({ value: { text: draft, cursor: draft.length } }));
        on("env.get", ($, e) => ({ value: env[e.name] }));
        on("session.id", () => ({ value: "sess-1" }));
        on("fs.list", () => ({
            value: [
                { name: "-other", kind: "dir", ...ENTRY },
                { name: "-work", kind: "dir", ...ENTRY },
            ],
        }));
        on("fs.exists", ($, e) => ({ value: e.path === DIR || e.path === `${DIR}/1.png` }));
        on("fs.read", ($, e) => ({
            value: {
                base64: e.path.endsWith(".bmp")
                    ? bmpBase64(
                          Array.from({ length: 2 }, () => Array.from({ length: 8 }, () => [255, 0, 0])),
                          true,
                      )
                    : pngHead(100, 100),
            },
        }));
        on("process.run", ($, e) => {
            runs.push([...e.argv]);
            return { value: { exitCode: 0, stdout: "", stderr: "" } };
        });
        on("ui.render", () => ({ type: "Text", props: {}, children: ["engine band"] }));

        await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" });
        await clock.advance(200);

        const ui = await $.ui.mount(BAND);
        const raster = await ui.find({ type: "Raster" });
        expect(raster?.props).toMatchObject({ columns: 4, rows: 1 });
        expect(await ui.find({ type: "Image" })).toBeUndefined();
        expect(runs[0]).toEqual([
            "sips",
            "-z",
            "2",
            "8",
            "-s",
            "format",
            "bmp",
            `${DIR}/1.png`,
            "--out",
            `${DIR}/1.image-peek-4x1.bmp`,
        ]);
        // #2 has no cached file, so it gets a placeholder tile and nothing to enlarge.
        expect(await ui.find({ type: "Text", text: "no preview" })).toBeDefined();
        expect(await ui.find({ type: "Text", text: "engine band" })).toBeDefined();

        await ui.press({ type: "Button", key: "enlarge-1" });
        expect(runs.at(-1)?.slice(0, 2)).toEqual(["sh", "-c"]);
        expect(runs.at(-1)?.at(-1)).toBe(`${DIR}/1.png`);
        await ui.unmount();
    });

    test("draws real pixels in Ghostty, with no thumbnail to scale", async ($, on) => {
        const clock = mock.clock(on);
        const runs: string[][] = [];
        const env: Record<string, string> = { CLAUDE_CODE_TMPDIR: "/tmp/claude-501", TERM_PROGRAM: "ghostty" };
        const draft = "[Image #1]";
        on("session.start", () => ({ cwd: "/work" }));
        on("prompt.read", () => ({ value: { text: draft, cursor: draft.length } }));
        on("env.get", ($, e) => ({ value: env[e.name] }));
        on("session.id", () => ({ value: "sess-1" }));
        on("fs.list", () => ({ value: [{ name: "-work", kind: "dir", ...ENTRY }] }));
        on("fs.exists", () => ({ value: true }));
        on("fs.read", () => ({ value: { base64: pngHead(800, 400) } }));
        on("process.run", ($, e) => {
            runs.push([...e.argv]);
            return { value: { exitCode: 0, stdout: "", stderr: "" } };
        });
        on("ui.render", () => ({ type: "Text", props: {}, children: ["engine band"] }));

        await $.session.start({ surface: "terminal", isInteractive: true, cwd: "/work" });
        await clock.advance(200);

        const ui = await $.ui.mount(BAND);
        const image = await ui.find({ type: "Image" });
        expect(image?.props).toMatchObject({ source: { file: `${DIR}/1.png`, format: "png" } });
        expect(await ui.find({ type: "Raster" })).toBeUndefined();
        expect(runs).toEqual([]);
        await ui.unmount();
    });
});
