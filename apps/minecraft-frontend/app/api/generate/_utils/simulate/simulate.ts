import sharp from "sharp";

import { INNER, OUTER } from "./layers";
import { render } from "./render";
import { srgbToLinear } from "./utils";

const STEPS = 20;

export async function* simulate(target: Buffer) {
  // prettier-ignore
  const { data } = await sharp(target)
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const linear = new Float32Array(64 * 64 * 3);

  const alpha = new Uint8Array(64 * 64);
  const inner = new Uint8Array(64 * 64);
  const outer = new Uint8Array(64 * 64);

  for (let i = 0; i < 64 * 64; i++) {
    linear[i * 3] = srgbToLinear(data[i * 4]);
    linear[i * 3 + 1] = srgbToLinear(data[i * 4 + 1]);
    linear[i * 3 + 2] = srgbToLinear(data[i * 4 + 2]);

    alpha[i] = data[i * 4 + 3];

    if (alpha[i] > 0 && INNER[i]) inner[i] = 1;
    if (alpha[i] > 0 && OUTER[i]) outer[i] = 1;
  }

  for (let s = 0; s < STEPS; s++) {
    yield { image: await render(s / (STEPS - 1), linear, alpha, null, inner) };
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  for (let s = 0; s < STEPS; s++) {
    yield { image: await render(s / (STEPS - 1), linear, alpha, inner, outer) };
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
