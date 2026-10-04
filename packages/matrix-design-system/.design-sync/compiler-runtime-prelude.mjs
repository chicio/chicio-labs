// The package's React Compiler output calls c() from react/compiler-runtime. The converter's React
// shim maps that import to window.React, where React 19 keeps c() under __COMPILER_RUNTIME, so every
// compiled component threw "c is not a function" when rendered from _ds_bundle.js. Listed FIRST in
// cfg.extraEntries, this module runs before any component module copies the shim's properties.
const react = typeof window === "undefined" ? undefined : window.React;

if (react && typeof react.c !== "function" && typeof react.__COMPILER_RUNTIME?.c === "function") {
    react.c = react.__COMPILER_RUNTIME.c;
}

export const __dsCompilerRuntimePrelude = true;
