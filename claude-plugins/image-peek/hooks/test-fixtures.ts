const toBinary = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

export const pngHead = (width: number, height: number): string => {
    const bytes = new Uint8Array(33);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
    const view = new DataView(bytes.buffer);
    view.setUint32(16, width);
    view.setUint32(20, height);
    return btoa(toBinary(bytes));
};

/** A 24-bit BMP of `rows` of `[r, g, b]` pixels, bottom-up as BMPs usually are, or top-down. */
export const bmp = (rows: number[][][], topDown = false): Uint8Array => {
    const height = rows.length;
    const width = rows[0].length;
    const stride = Math.ceil((width * 3) / 4) * 4;
    const bytes = new Uint8Array(54 + stride * height);
    const view = new DataView(bytes.buffer);
    bytes.set([0x42, 0x4d]);
    view.setUint32(2, bytes.length, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, topDown ? -height : height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    rows.forEach((row, y) => {
        const start = 54 + stride * (topDown ? y : height - 1 - y);
        row.forEach(([r, g, b], x) => {
            bytes.set([b, g, r], start + x * 3);
        });
    });
    return bytes;
};

export const bmpBase64 = (rows: number[][][], topDown = false): string => btoa(toBinary(bmp(rows, topDown)));
