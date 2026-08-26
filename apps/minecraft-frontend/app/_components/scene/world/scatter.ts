export type Placement = readonly [number, number];

export type Patch = {
  salt: number;
  chance: number;
  tries: number;
  spread: number;
  keep: number;
  clearing: number;
  radius: number;
};

const SEED = 20260818;
const CHUNK = 16;

const DEFAULTS: Patch = {
  salt: 0,
  chance: 0.3,
  tries: 24,
  spread: 4,
  keep: 0.5,
  clearing: 3,
  radius: 48,
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chunkRandom(x: number, z: number, salt: number) {
  let h =
    Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(z | 0, 0x85ebca6b) ^ SEED ^ salt;
  h ^= h >>> 15;

  return mulberry32(Math.imul(h, 0xc2b2ae35));
}

function offset(x: number, z: number): [number, number] {
  let h = Math.imul(x | 0, 0x2f6b1a3d) ^ Math.imul(z | 0, 0x6e5d3b1f);
  h ^= h >>> 13;
  h = Math.imul(h, 0x27d4eb2d);
  h ^= h >>> 15;

  const axis = (bits: number) => ((bits & 15) / 15 - 0.5) * 0.5;

  return [axis(h >>> 4), axis(h >>> 12)];
}

export function scatter(patch: Partial<Patch> = {}): Placement[] {
  const { salt, chance, tries, spread, keep, clearing, radius } = {
    ...DEFAULTS,
    ...patch,
  };
  const chunks = Math.ceil(radius / CHUNK);
  const taken = new Set<number>();
  const at: Placement[] = [];

  for (let cz = -chunks; cz <= chunks; cz++) {
    for (let cx = -chunks; cx <= chunks; cx++) {
      const random = chunkRandom(cx, cz, salt);
      if (random() >= chance) continue;

      const originX = cx * CHUNK + Math.floor(random() * CHUNK);
      const originZ = cz * CHUNK + Math.floor(random() * CHUNK);

      for (let i = 0; i < tries; i++) {
        const dx =
          Math.floor(random() * (spread + 1)) -
          Math.floor(random() * (spread + 1));
        const dz =
          Math.floor(random() * (spread + 1)) -
          Math.floor(random() * (spread + 1));
        if (random() > keep) continue;

        const x = originX + dx;
        const z = originZ + dz;
        const distance = Math.hypot(x, z);
        if (distance < clearing || distance > radius) continue;

        const key = ((x & 0xffff) << 16) | (z & 0xffff);
        if (taken.has(key)) continue;
        taken.add(key);

        const [offsetX, offsetZ] = offset(x, z);
        at.push([x + offsetX, z + offsetZ]);
      }
    }
  }

  return at;
}
