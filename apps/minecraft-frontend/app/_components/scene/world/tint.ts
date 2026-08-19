import * as THREE from "three";

const BIOME = "/resources/server/minecraft/worldgen/biome/plains.json";
const COLORMAPS = "/resources/client/minecraft/textures/colormap";

const cache = new Map<string, Promise<THREE.Color>>();

async function sample(map: string) {
  const [biome, colormap] = await Promise.all([
    fetch(BIOME).then((r) => r.json() as Promise<{ temperature: number; downfall: number }>),
    fetch(`${COLORMAPS}/${map}.png`)
      .then((r) => r.blob())
      .then(createImageBitmap),
  ]);

  const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
  const temperature = clamp(biome.temperature);
  const humidity = clamp(biome.downfall) * temperature;

  const context = new OffscreenCanvas(colormap.width, colormap.height).getContext("2d")!;
  context.drawImage(colormap, 0, 0);

  const [red, green, blue] = context.getImageData(
    Math.trunc((1 - temperature) * 255),
    Math.trunc((1 - humidity) * 255),
    1,
    1,
  ).data;

  return new THREE.Color().setRGB(red / 255, green / 255, blue / 255, THREE.SRGBColorSpace);
}

export function tint(map = "grass"): Promise<THREE.Color> {
  let color = cache.get(map);
  if (!color) cache.set(map, (color = sample(map)));
  return color;
}
