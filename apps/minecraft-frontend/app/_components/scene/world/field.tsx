"use client";

import { use } from "react";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { normal, quads, type Quad } from "./quads";
import type { Placement } from "./scatter";
import { shadow } from "./shadow";
import { tint } from "./tint";

const TEXTURES = "/resources/client/minecraft/textures";

const cache = new Map<string, Promise<[Quad[], THREE.Color]>>();

function load(block: string) {
  let entry = cache.get(block);
  if (!entry) cache.set(block, (entry = Promise.all([quads(block), tint()])));
  return entry;
}

function group(faces: Quad[]) {
  const groups = new Map<string, Quad[]>();
  for (const face of faces) {
    const existing = groups.get(face.texture);
    if (existing) existing.push(face);
    else groups.set(face.texture, [face]);
  }
  return [...groups];
}

function build(at: readonly Placement[], faces: Quad[], colour: THREE.Color) {
  const count = at.length * faces.length;
  const position = new Float32Array(count * 12);
  const normals = new Float32Array(count * 12);
  const colours = new Float32Array(count * 12);
  const uv = new Float32Array(count * 8);
  const index = new Uint32Array(count * 6);

  const shaded = faces.map((face) =>
    face.shade ? normal(face) : ([0, 1, 0] as const),
  );
  const tints = faces.map((face) =>
    face.tinted
      ? ([colour.r, colour.g, colour.b] as const)
      : ([1, 1, 1] as const),
  );

  let quad = 0;
  for (const [x, z] of at) {
    for (let f = 0; f < faces.length; f++) {
      const v = quad * 4;

      for (let c = 0; c < 4; c++) {
        const [cx, cy, cz] = faces[f].corners[c];
        position.set([x + cx, cy, z + cz], (v + c) * 3);
        normals.set(shaded[f], (v + c) * 3);
        colours.set(tints[f], (v + c) * 3);
        uv.set(faces[f].uv[c], (v + c) * 2);
      }

      index.set([v, v + 1, v + 2, v, v + 2, v + 3], quad * 6);
      quad++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

function pixelate(map: THREE.Texture) {
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  map.needsUpdate = true;
}

export function Field({
  block,
  at,
}: {
  block: string;
  at: readonly Placement[];
}) {
  const [faces, colour] = use(load(block));
  const groups = group(faces);
  const maps = useTexture(
    groups.map(([texture]) => `${TEXTURES}/${texture}.png`),
    (loaded) => [loaded].flat().forEach(pixelate),
  );
  const cast = shadow(at, faces);

  return (
    <>
      {groups.map(([texture, parts], i) => (
        <mesh key={texture} geometry={build(at, parts, colour)}>
          <meshStandardMaterial
            map={maps[i]}
            vertexColors
            alphaTest={0.4}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}

      {cast.index!.count > 0 && (
        <mesh geometry={cast} renderOrder={2}>
          <meshBasicMaterial
            color="#2f4a58"
            vertexColors
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}
