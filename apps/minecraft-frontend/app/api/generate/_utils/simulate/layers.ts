type Box = { u: number; v: number; w: number; h: number; d: number };

export const INNER = rasterize([
  { u: 0, v: 0, w: 8, h: 8, d: 8 },
  { u: 16, v: 16, w: 8, h: 12, d: 4 },
  { u: 40, v: 16, w: 4, h: 12, d: 4 },
  { u: 32, v: 48, w: 4, h: 12, d: 4 },
  { u: 0, v: 16, w: 4, h: 12, d: 4 },
  { u: 16, v: 48, w: 4, h: 12, d: 4 },
]);

export const OUTER = rasterize([
  { u: 32, v: 0, w: 8, h: 8, d: 8 },
  { u: 16, v: 32, w: 8, h: 12, d: 4 },
  { u: 40, v: 32, w: 4, h: 12, d: 4 },
  { u: 48, v: 48, w: 4, h: 12, d: 4 },
  { u: 0, v: 32, w: 4, h: 12, d: 4 },
  { u: 0, v: 48, w: 4, h: 12, d: 4 },
]);

function rasterize(boxes: Box[]) {
  const mask = new Uint8Array(64 * 64);

  for (const { u, v, w, h, d } of boxes) {
    fill(mask, u + d, v, 2 * w, d);
    fill(mask, u, v + d, 2 * w + 2 * d, h);
  }

  return mask;
}

function fill(mask: Uint8Array, x: number, y: number, w: number, h: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      mask[yy * 64 + xx] = 1;
    }
  }
}
