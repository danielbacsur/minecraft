import * as THREE from "three";

import { normal, type Quad } from "./quads";
import type { Placement } from "./scatter";

const WIDTH = 0.2;
const ALPHA = 0.35;
const HEIGHT = 0.002;

const ALONG: [number, number][] = [
  [0, 0],
  [0.16, 1],
  [0.84, 1],
  [1, 0],
];

const ACROSS: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
];

function footprints(faces: Quad[]) {
  if (!faces.length || faces.some((face) => Math.abs(normal(face)[1]) > 1e-6)) return [];

  const lines = new Map<string, [number, number, number, number]>();

  for (const { corners } of faces) {
    const ends = [
      [corners[0][0], corners[0][2]],
      [corners[2][0], corners[2][2]],
    ].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const line = [...ends[0], ...ends[1]] as [number, number, number, number];
    lines.set(line.map((n) => n.toFixed(4)).join(), line);
  }

  return [...lines.values()];
}

export function shadow(at: readonly Placement[], faces: Quad[]) {
  const lines = footprints(faces);
  const position: number[] = [];
  const colour: number[] = [];
  const index: number[] = [];

  for (const [x, z] of at) {
    for (const [ax, az, bx, bz] of lines) {
      const first = position.length / 3;
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.hypot(dx, dz);
      const px = (-dz / length) * WIDTH;
      const pz = (dx / length) * WIDTH;

      for (const [along, lit] of ALONG) {
        for (const [across, core] of ACROSS) {
          position.push(
            x + ax + dx * along + px * across,
            HEIGHT,
            z + az + dz * along + pz * across,
          );
          colour.push(1, 1, 1, lit * core * ALPHA);
        }
      }

      for (let a = 0; a + 1 < ALONG.length; a++) {
        for (let c = 0; c + 1 < ACROSS.length; c++) {
          const v = first + a * ACROSS.length + c;
          const next = v + ACROSS.length;
          index.push(v, v + 1, next + 1, v, next + 1, next);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colour, 4));
  geometry.setIndex(index);

  return geometry;
}
