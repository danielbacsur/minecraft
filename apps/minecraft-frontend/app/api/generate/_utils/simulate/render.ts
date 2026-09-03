import { NOISE } from "./noise";
import { linearToSrgb } from "./utils";

export function render(
  t: number,
  linear: Float32Array,
  alpha: Uint8Array,
  from: Uint8Array | null,
  to: Uint8Array,
) {
  const blend = Math.sin(0.5 * Math.PI * t);
  const frame = new Uint8Array(64 * 64 * 4);

  const offsetX = (Math.random() * 64) | 0;
  const offsetY = (Math.random() * 64) | 0;

  for (let i = 0; i < 64 * 64; i++) {
    if (from && from[i]) {
      for (let channel = 0; channel < 3; channel++) {
        frame[i * 4 + channel] = linearToSrgb(linear[i * 3 + channel]);
      }

      frame[i * 4 + 3] = alpha[i];
    } else if (to[i]) {
      const noiseX = ((i & (64 - 1)) + offsetX) & (64 - 1);
      const noiseY = ((i >> 6) + offsetY) & (64 - 1);
      const noise = (noiseY * 64 + noiseX) * 3;

      for (let channel = 0; channel < 3; channel++) {
        const speckle = (1 - blend) * NOISE[noise + channel];
        const texture = blend * linear[i * 3 + channel];

        frame[i * 4 + channel] = linearToSrgb(speckle + texture);
      }

      frame[i * 4 + 3] = alpha[i];
    }
  }

  return frame;
}
