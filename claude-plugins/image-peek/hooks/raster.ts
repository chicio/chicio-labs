export type Pixels = { width: number; height: number; rgb: Uint8Array };

const FULL_BLOCK = 0x2588;
// The quadrant glyph for each mask of foreground pixels: 1 top left, 2 top right, 4 bottom left, 8 bottom right.
// Mask 0 never happens, since the first seed is always foreground.
const QUADRANTS = [
    0x20, 0x2598, 0x259d, 0x2580, 0x2596, 0x258c, 0x259e, 0x259b, 0x2597, 0x259a, 0x2590, 0x259c, 0x2584, 0x2599,
    0x259f, 0x2588,
];

/**
 * The pixels of an uncompressed 24- or 32-bit BMP (what `sips -s format bmp` writes), top row first;
 * null for anything else.
 */
export const parseBmp = (bytes: Uint8Array): Pixels | null => {
    if (bytes.length < 54 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) {
        return null;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const offset = view.getUint32(10, true);
    const width = view.getInt32(18, true);
    const signedHeight = view.getInt32(22, true);
    const bitsPerPixel = view.getUint16(28, true);
    const compression = view.getUint32(30, true);
    const isBitfields = compression === 3 && bitsPerPixel === 32;
    if (width <= 0 || signedHeight === 0 || (bitsPerPixel !== 24 && bitsPerPixel !== 32)) {
        return null;
    }
    if (compression !== 0 && !isBitfields) {
        return null;
    }
    const height = Math.abs(signedHeight);
    const isBottomUp = signedHeight > 0;
    const bytesPerPixel = bitsPerPixel / 8;
    const stride = Math.ceil((width * bytesPerPixel) / 4) * 4;
    if (offset + stride * height > bytes.length) {
        return null;
    }
    const rgb = new Uint8Array(width * height * 3);
    for (let y = 0; y < height; y++) {
        const row = offset + stride * (isBottomUp ? height - 1 - y : y);
        for (let x = 0; x < width; x++) {
            const source = row + x * bytesPerPixel;
            const target = (y * width + x) * 3;
            rgb[target] = bytes[source + 2];
            rgb[target + 1] = bytes[source + 1];
            rgb[target + 2] = bytes[source];
        }
    }
    return { width, height, rgb };
};

type Rgb = [number, number, number];

const pixelAt = (pixels: Pixels, x: number, y: number): Rgb => {
    const index = (y * pixels.width + x) * 3;
    return [pixels.rgb[index], pixels.rgb[index + 1], pixels.rgb[index + 2]];
};

const distance = (a: Rgb, b: Rgb): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const average = (colors: Rgb[]): number => {
    const channel = (i: number) => Math.round(colors.reduce((sum, color) => sum + color[i], 0) / colors.length);
    return (channel(0) << 16) | (channel(1) << 8) | channel(2);
};

/**
 * One cell for its 2x2 pixels (top left, top right, bottom left, bottom right): the two most different pixels
 * seed a foreground and a background, every pixel joins the nearer, and the glyph covers the foreground ones.
 */
const quadrantCell = (quad: Rgb[]): [number, number, number] => {
    let seeds: [number, number] = [0, 0];
    let widest = -1;
    for (let a = 0; a < 4; a++) {
        for (let b = a + 1; b < 4; b++) {
            const d = distance(quad[a], quad[b]);
            if (d > widest) {
                widest = d;
                seeds = [a, b];
            }
        }
    }
    if (widest === 0) {
        const color = average(quad);
        return [FULL_BLOCK, color, color];
    }
    let mask = 0;
    const foreground: Rgb[] = [];
    const background: Rgb[] = [];
    quad.forEach((pixel, i) => {
        if (distance(pixel, quad[seeds[0]]) <= distance(pixel, quad[seeds[1]])) {
            mask |= 1 << i;
            foreground.push(pixel);
        } else {
            background.push(pixel);
        }
    });
    return [QUADRANTS[mask], average(foreground), average(background)];
};

/**
 * A Raster's `cells` for pixels exactly `columns * 2` wide and `rows * 2` tall: each cell a quadrant block
 * drawing its four pixels in the two colors that fit them best.
 */
export const quadrantCells = (pixels: Pixels, columns: number, rows: number): string | null => {
    if (pixels.width !== columns * 2 || pixels.height !== rows * 2) {
        return null;
    }
    const words = new Uint32Array(columns * rows * 3);
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = column * 2;
            const y = row * 2;
            const quad = [
                pixelAt(pixels, x, y),
                pixelAt(pixels, x + 1, y),
                pixelAt(pixels, x, y + 1),
                pixelAt(pixels, x + 1, y + 1),
            ];
            words.set(quadrantCell(quad), (row * columns + column) * 3);
        }
    }
    return toBase64(new Uint8Array(words.buffer));
};

const toBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    for (let start = 0; start < bytes.length; start += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
    }
    return btoa(binary);
};

export const fromBase64 = (base64: string): Uint8Array => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
