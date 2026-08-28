const PACK = "/resources/client/minecraft";

type Vec = [number, number, number];

type Rotation = {
  origin: Vec;
  axis: "x" | "y" | "z";
  angle: number;
  rescale?: boolean;
};

export type Quad = {
  corners: Vec[];
  uv: [number, number][];
  texture: string;
  tinted: boolean;
  shade: boolean;
};

const read = (kind: string, id: string) =>
  fetch(`${PACK}/${kind}/${id.replace("minecraft:", "")}.json`).then((r) =>
    r.json(),
  );

const CORNERS: Record<string, Vec[]> = {
  north: [
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  south: [
    [0, 1, 1],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  west: [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 1],
  ],
  east: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
    [1, 1, 0],
  ],
  up: [
    [0, 1, 0],
    [0, 1, 1],
    [1, 1, 1],
    [1, 1, 0],
  ],
  down: [
    [0, 0, 1],
    [0, 0, 0],
    [1, 0, 0],
    [1, 0, 1],
  ],
};

const extentUV = (side: string, from: Vec, to: Vec) =>
  ({
    north: [16 - to[0], 16 - to[1], 16 - from[0], 16 - from[1]],
    south: [from[0], 16 - to[1], to[0], 16 - from[1]],
    west: [from[2], 16 - to[1], to[2], 16 - from[1]],
    east: [16 - to[2], 16 - to[1], 16 - from[2], 16 - from[1]],
    up: [from[0], from[2], to[0], to[2]],
    down: [from[0], 16 - to[2], to[0], 16 - from[2]],
  })[side]!;

function turn(point: Vec, rotation?: Rotation): Vec {
  if (!rotation) return point;

  const radians = (rotation.angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const scale = rotation.rescale ? 1 / cos : 1;

  let [x, y, z] = point.map((n, i) => n - rotation.origin[i]) as Vec;
  if (rotation.axis === "x")
    [y, z] = [(y * cos - z * sin) * scale, (y * sin + z * cos) * scale];
  if (rotation.axis === "y")
    [x, z] = [(x * cos + z * sin) * scale, (-x * sin + z * cos) * scale];
  if (rotation.axis === "z")
    [x, y] = [(x * cos - y * sin) * scale, (x * sin + y * cos) * scale];

  return [
    x + rotation.origin[0],
    y + rotation.origin[1],
    z + rotation.origin[2],
  ];
}

type Element = {
  from: Vec;
  to: Vec;
  rotation?: Rotation;
  shade?: boolean;
  faces: Record<string, { uv?: number[]; texture: string; tintindex?: number }>;
};

export async function quads(block: string): Promise<Quad[]> {
  const { variants } = await read("blockstates", block);
  const first = Object.values(variants ?? {})[0];

  const chain = [];
  for (
    let id = (Array.isArray(first) ? first[0] : first)?.model;
    id;
    id = chain[chain.length - 1].parent
  ) {
    chain.push(await read("models", id));
  }

  const elements: Element[] =
    chain.find((model) => model.elements)?.elements ?? [];
  const textures = Object.assign(
    {},
    ...chain.reverse().map((model) => model.textures),
  );

  return elements.flatMap((element) =>
    Object.entries(element.faces).map(([side, face]) => {
      const [u1, v1, u2, v2] =
        face.uv ?? extentUV(side, element.from, element.to);

      let texture: unknown = face.texture;
      while (
        typeof texture === "object" ||
        (texture as string).startsWith("#")
      ) {
        texture =
          typeof texture === "object"
            ? (texture as { sprite: string }).sprite
            : textures[(texture as string).slice(1)];
      }

      return {
        texture: (texture as string).replace("minecraft:", ""),
        tinted: face.tintindex !== undefined,
        shade: element.shade !== false,
        corners: CORNERS[side].map((corner) => {
          const at = corner.map(
            (end, i) => (end ? element.to : element.from)[i],
          ) as Vec;
          return turn(at, element.rotation).map((n) => n / 16) as Vec;
        }),
        uv: (
          [
            [u1, v1],
            [u1, v2],
            [u2, v2],
            [u2, v1],
          ] as const
        ).map(([u, v]) => [u / 16, 1 - v / 16] as [number, number]),
      };
    }),
  );
}

export function normal({ corners }: Quad): Vec {
  const [a, b, c] = corners;
  const u = b.map((n, i) => n - a[i]) as Vec;
  const v = c.map((n, i) => n - a[i]) as Vec;
  const cross: Vec = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const length = Math.hypot(...cross) || 1;

  return cross.map((n) => n / length) as Vec;
}
