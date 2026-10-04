import { describe, expect, test } from "claude-code/testing";

import { fromBase64, quadrantCells, parseBmp } from "./raster";
import { bmp } from "./test-fixtures";

const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const WHITE = [255, 255, 255];

const words = (base64: string): number[] => {
    const bytes = fromBase64(base64);
    return [...new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)];
};

describe("raster", () => {
    describe("parseBmp", () => {
        test("reads a bottom-up 24-bit BMP top row first, padding skipped", () => {
            const pixels = parseBmp(
                bmp([
                    [RED, GREEN, BLUE],
                    [WHITE, RED, GREEN],
                ]),
            );
            expect(pixels?.width).toBe(3);
            expect(pixels?.height).toBe(2);
            expect([...(pixels?.rgb ?? [])]).toEqual([...RED, ...GREEN, ...BLUE, ...WHITE, ...RED, ...GREEN]);
        });

        test("reads a top-down BMP, as sips writes it", () => {
            const pixels = parseBmp(bmp([[RED], [BLUE]], true));
            expect([...(pixels?.rgb ?? [])]).toEqual([...RED, ...BLUE]);
        });

        test("refuses anything that is not an uncompressed BMP", () => {
            expect(parseBmp(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
            const truncated = bmp([[RED, GREEN]]).slice(0, 56);
            expect(parseBmp(truncated)).toBeNull();
        });
    });

    describe("quadrantCells", () => {
        test("draws each 2x2 block in its two colors, the glyph covering the foreground pixels", () => {
            const pixels = parseBmp(
                bmp([
                    [RED, BLUE, GREEN, GREEN],
                    [RED, RED, GREEN, GREEN],
                ]),
            );
            const cells = pixels === null ? null : quadrantCells(pixels, 2, 1);
            // Red covers top left and both bottoms (▙); the flat green cell is a full block.
            expect(words(cells ?? "")).toEqual([0x2599, 0xff0000, 0x0000ff, 0x2588, 0x00ff00, 0x00ff00]);
        });

        test("refuses pixels that are not exactly the grid's size", () => {
            const pixels = parseBmp(bmp([[RED, GREEN]]));
            expect(pixels === null ? "parsed" : quadrantCells(pixels, 1, 1)).toBeNull();
        });
    });
});
