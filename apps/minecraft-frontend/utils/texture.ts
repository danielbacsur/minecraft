import { readFile } from "node:fs/promises";
import { join } from "node:path";

const TEXTURES = join(process.cwd(), "textures");

export function texture(id: string) {
  return readFile(join(TEXTURES, `${id}.png`));
}
