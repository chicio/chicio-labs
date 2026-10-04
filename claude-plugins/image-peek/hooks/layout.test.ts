import { describe, expect, test } from "claude-code/testing";

import { fitCells, fitRow, imageNumbers, pngSize } from "./layout";
import { pngHead } from "./test-fixtures";

describe("layout", () => {
    describe("imageNumbers", () => {
        test("come from the draft, deduplicated, in order", () => {
            expect(imageNumbers("look [Image #2] and [Image #1] again [Image #2]")).toEqual([2, 1]);
            expect(imageNumbers("[Image 1] [image #3] #4")).toEqual([]);
        });
    });

    describe("pngSize", () => {
        test("is read from the IHDR header", () => {
            expect(pngSize(pngHead(1630, 632))).toEqual({ width: 1630, height: 632 });
            expect(pngSize(btoa("\xff\xd8\xff\xe0 this is a jpeg, not a png..."))).toBeNull();
        });
    });

    describe("fitCells", () => {
        test("keeps the aspect ratio within the tile", () => {
            expect(fitCells({ width: 500, height: 500 })).toEqual({ columns: 24, rows: 12 });
            expect(fitCells({ width: 3000, height: 500 })).toEqual({ columns: 48, rows: 4 });
            expect(fitCells({ width: 100, height: 2000 })).toEqual({ columns: 4, rows: 12 });
        });
    });

    describe("fitRow", () => {
        test("shrinks the tiles to fit the band so it never scrolls", () => {
            const square = { width: 500, height: 500 };
            expect(fitRow([square], 20, 120)).toEqual([{ columns: 24, rows: 12 }]);
            expect(fitRow([square], 7, 120)).toEqual([{ columns: 8, rows: 4 }]);
            expect(fitRow([square, square, square], 20, 40)).toEqual([
                { columns: 10, rows: 5 },
                { columns: 10, rows: 5 },
                { columns: 10, rows: 5 },
            ]);
        });
    });
});
