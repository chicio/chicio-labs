// The paste detection and the cache lookup are adapted from jarrodwatts/claude-image-view (hooks/register.tsx),
// MIT License, Copyright (c) 2026 Jarrod Watts. The full notice is in LICENSE-claude-image-view.
import { atom, read, update } from "claude-code";
import type { EngineInterface, Register } from "claude-code";

import type { PastedImage } from "../types";
import { fitRow, imageNumbers, pngSize } from "./layout";
import type { Cells, Size } from "./layout";
import { fromBase64, quadrantCells, parseBmp } from "./raster";
import { drawingFor } from "./terminal";
import type { Drawing } from "./terminal";

// Pasting an image raises no prompt.edit (the tag only shows up on the next keystroke), so the draft is polled.
const POLL_MS = 200;

const imagesAtom = atom({ plugin: "image-peek", key: "images" } as const, [] as PastedImage[]);

type Engine = EngineInterface;

let tmpRoot: string | undefined;
let found: { sessionId: string; dir: string } | undefined;
let drawing: Drawing | undefined;
// The image numbers last drawn, so an unchanged draft doesn't rewrite state; undefined while a drawn
// image's file is still missing, so the next poll looks again.
let shownKey: string | undefined;
let isChecking = false;
const sizes = new Map<string, Size | null>();
const thumbnails = new Map<string, Promise<string | null>>();

// Claude Code caches each paste as <tmp>/<project>/<session>/images/<n>.png. The project folder is named
// after a working directory that may since have moved, so it is found by the session id instead.
const imagesDir = async ($: Engine): Promise<string | undefined> => {
    const sessionId = await $.session.id();
    if (found?.sessionId === sessionId) {
        return found.dir;
    }
    if (tmpRoot === undefined) {
        const fromEnv = await $.env.get("CLAUDE_CODE_TMPDIR");
        tmpRoot = fromEnv ?? `/tmp/claude-${(await $.process.run(["id", "-u"])).stdout.trim()}`;
    }
    const entries = await $.fs.list(tmpRoot).catch(() => []);
    for (const entry of entries) {
        const dir = `${tmpRoot}/${entry.name}/${sessionId}/images`;
        if (entry.kind === "dir" && (await $.fs.exists(dir))) {
            found = { sessionId, dir };
            return dir;
        }
    }
    return undefined;
};

const describe = async ($: Engine, dir: string | undefined, n: number): Promise<PastedImage> => {
    const path = `${dir}/${n}.png`;
    if (dir === undefined || !(await $.fs.exists(path))) {
        return { n, path: null, size: null };
    }
    if (!sizes.has(path)) {
        const head = await $.fs.read(path, { as: "bytes" }).then(
            ({ base64 }) => pngSize(base64),
            // Too big to read: still drawable, just without its aspect ratio.
            () => undefined,
        );
        if (head === null) {
            return { n, path: null, size: null };
        }
        sizes.set(path, head ?? null);
    }
    return { n, path, size: sizes.get(path) ?? null };
};

const show = async ($: Engine, draft: string) => {
    const numbers = imageNumbers(draft);
    const key = numbers.join(",");
    if (key === shownKey) {
        return;
    }
    const dir = numbers.length > 0 ? await imagesDir($) : undefined;
    const list: PastedImage[] = [];
    for (const n of numbers) {
        list.push(await describe($, dir, n));
    }
    shownKey = list.every((image) => image.path !== null) ? key : undefined;
    await update($, imagesAtom, () => list);
};

const check = async ($: Engine) => {
    if (isChecking) {
        return;
    }
    isChecking = true;
    try {
        await show($, (await $.prompt.read()).text);
    } finally {
        isChecking = false;
    }
};

const drawingHere = async ($: Engine): Promise<Drawing> => {
    if (drawing === undefined) {
        drawing = drawingFor({
            forceImages: await $.env.get("CLAUDE_CODE_FORCE_TERMINAL_IMAGES"),
            tmux: await $.env.get("TMUX"),
            termProgram: await $.env.get("TERM_PROGRAM"),
            term: await $.env.get("TERM"),
            kittyWindowId: await $.env.get("KITTY_WINDOW_ID"),
        });
    }
    return drawing;
};

// sips scales the PNG to exactly one pixel per quarter cell and writes it as a BMP, which is cheap to read here.
const renderThumbnail = async ($: Engine, path: string, { columns, rows }: Cells): Promise<string | null> => {
    const bmp = path.replace(/\.png$/, `.image-peek-${columns}x${rows}.bmp`);
    const result = await $.process.run([
        "sips",
        "-z",
        String(rows * 2),
        String(columns * 2),
        "-s",
        "format",
        "bmp",
        path,
        "--out",
        bmp,
    ]);
    if (result.exitCode !== 0) {
        throw new Error(`sips exited ${result.exitCode}: ${result.stderr}`);
    }
    const { base64 } = await $.fs.read(bmp, { as: "bytes" });
    const pixels = parseBmp(fromBase64(base64));
    return pixels === null ? null : quadrantCells(pixels, columns, rows);
};

const thumbnail = ($: Engine, path: string, cells: Cells): Promise<string | null> => {
    const key = `${path}@${cells.columns}x${cells.rows}`;
    let pending = thumbnails.get(key);
    if (pending === undefined) {
        // A failed thumbnail is forgotten, so the next drawing tries again.
        pending = renderThumbnail($, path, cells).catch(() => {
            thumbnails.delete(key);
            return null;
        });
        thumbnails.set(key, pending);
    }
    return pending;
};

// Quick Look stays open until the person closes it, longer than a process call may last, so it is detached; started
// from a background process its panel opens behind the terminal, so it is then brought to the front.
const QUICK_LOOK = `qlmanage -p "$1" >/dev/null 2>&1 &
sleep 0.5
osascript -e "tell application \\"System Events\\" to set frontmost of (first process whose unix id is $!) to true" >/dev/null 2>&1`;

const enlarge = ($: Engine, path: string) => {
    void $.process.run(["sh", "-c", QUICK_LOOK, "image-peek", path]);
};

export const register: Register = (on) => {
    on("session.start", async ($, e, next) => {
        $.clock.every(POLL_MS, () => check($));
        return next(e);
    });

    on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
        if (e.surface !== "terminal" || e.props.hasSurvey) {
            return next(e);
        }
        const list = await read($, imagesAtom);
        if (list.length === 0) {
            return next(e);
        }

        const { Box, Button, Image, Raster, Text } = $.ui.resolve(e);
        const mode = await drawingHere($);
        const cells = fitRow(
            list.map((image) => image.size),
            e.props.maxRows,
            e.props.bodyColumns,
        );
        const pictures = await Promise.all(
            list.map((image, i) =>
                image.path === null || mode === "pixels"
                    ? Promise.resolve(null)
                    : thumbnail($, image.path, cells[i] ?? { columns: 4, rows: 1 }),
            ),
        );
        const below = await next(e);

        return (
            <Box flexDirection="column">
                <Box flexDirection="row" columnGap={1}>
                    {list.map((image, i) => {
                        const { columns, rows } = cells[i] ?? { columns: 4, rows: 1 };
                        const path = image.path;
                        const picture = pictures[i];
                        return (
                            <Box flexDirection="column" alignItems="center" borderStyle="round" borderDimColor>
                                {path === null ? (
                                    <Box width={columns} height={rows} alignItems="center" justifyContent="center">
                                        <Text dimColor wrap="truncate">
                                            no preview
                                        </Text>
                                    </Box>
                                ) : mode === "pixels" ? (
                                    <Image
                                        key={`image-${image.n}`}
                                        source={{ file: path, format: "png" }}
                                        columns={columns}
                                        rows={rows}
                                        alt={`[Image #${image.n}]`}
                                    />
                                ) : picture === null ? (
                                    <Box width={columns} height={rows} alignItems="center" justifyContent="center">
                                        <Text dimColor wrap="truncate">
                                            [Image #{image.n}]
                                        </Text>
                                    </Box>
                                ) : (
                                    <Raster key={`image-${image.n}`} columns={columns} rows={rows} cells={picture} />
                                )}
                                {path === null ? (
                                    <Text dimColor>#{image.n}</Text>
                                ) : (
                                    <Button
                                        key={`enlarge-${image.n}`}
                                        label={image.n <= 9 ? "⤢" : `⤢ #${image.n}`}
                                        hotkey={image.n <= 9 ? String(image.n) : undefined}
                                        plain
                                        dimColor
                                        onPress={() => enlarge($, path)}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
                {below}
            </Box>
        );
    });
};
