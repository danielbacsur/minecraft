import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { srgbToLinear } from "./utils";

export const NOISE = await (async () => {
  const image = fileURLToPath(new URL("noise.png", import.meta.url));

  // prettier-ignore
  const { data: srgb } = await sharp(image)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const linear = new Float32Array(64 * 64 * 3);
  for (let i = 0; i < 64 * 64; i++) {
    linear[i * 3] = srgbToLinear(srgb[i * 4]);
    linear[i * 3 + 1] = srgbToLinear(srgb[i * 4 + 1]);
    linear[i * 3 + 2] = srgbToLinear(srgb[i * 4 + 2]);
  }

  return linear;
})();
