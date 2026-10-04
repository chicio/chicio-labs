export type TerminalEnv = {
    forceImages?: string;
    tmux?: string;
    termProgram?: string;
    term?: string;
    kittyWindowId?: string;
};

export type Drawing = "pixels" | "blocks";

/**
 * Whether Claude Code's `Image` can show real pixels here. It speaks only kitty graphics with Unicode
 * placeholders, which kitty and Ghostty draw and Warp, tmux and the rest do not; everywhere else the
 * picture is drawn with quadrant block characters instead.
 */
export const drawingFor = (env: TerminalEnv): Drawing => {
    if (env.forceImages === "1" || env.forceImages === "true") {
        return "pixels";
    }
    if (env.tmux !== undefined && env.tmux !== "") {
        return "blocks";
    }
    const program = env.termProgram?.toLowerCase();
    if (program === "ghostty" || program === "kitty") {
        return "pixels";
    }
    if (env.kittyWindowId !== undefined || env.term === "xterm-kitty" || env.term === "xterm-ghostty") {
        return "pixels";
    }
    return "blocks";
};
