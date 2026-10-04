import { describe, expect, test } from "claude-code/testing";

import { drawingFor } from "./terminal";

describe("drawingFor", () => {
    test("draws quadrant blocks in Warp and any terminal without kitty placeholders", () => {
        expect(drawingFor({ termProgram: "WarpTerminal", term: "xterm-256color" })).toBe("blocks");
        expect(drawingFor({ termProgram: "Apple_Terminal" })).toBe("blocks");
        expect(drawingFor({})).toBe("blocks");
    });

    test("draws real pixels in kitty and Ghostty", () => {
        expect(drawingFor({ termProgram: "ghostty" })).toBe("pixels");
        expect(drawingFor({ term: "xterm-kitty" })).toBe("pixels");
        expect(drawingFor({ kittyWindowId: "1" })).toBe("pixels");
    });

    test("draws quadrant blocks inside tmux, which passes no graphics through", () => {
        expect(drawingFor({ termProgram: "ghostty", tmux: "/tmp/tmux-501/default,1,0" })).toBe("blocks");
    });

    test("follows Claude Code's own override", () => {
        expect(drawingFor({ termProgram: "WarpTerminal", forceImages: "1" })).toBe("pixels");
    });
});
