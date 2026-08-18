"use client";

import { use, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PIXEL = 0.9375 / 16;
const FEET = 24;
const SKIN = 64;
const TPS = 20;

export const DEFAULT_SKIN =
  "/resources/client/minecraft/textures/entity/player/wide/steve.png";

function unwrap(
  box: THREE.BoxGeometry,
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number,
) {
  const face = (x1: number, y1: number, x2: number, y2: number) =>
    [
      [x1 / SKIN, 1 - y2 / SKIN],
      [x2 / SKIN, 1 - y2 / SKIN],
      [x2 / SKIN, 1 - y1 / SKIN],
      [x1 / SKIN, 1 - y1 / SKIN],
    ] as [number, number][];

  const top = face(u + depth, v, u + width + depth, v + depth);
  const bottom = face(u + width + depth, v, u + width * 2 + depth, v + depth);
  const left = face(u, v + depth, u + depth, v + depth + height);
  const front = face(u + depth, v + depth, u + width + depth, v + depth + height);
  const right = face(u + width + depth, v + depth, u + width + depth * 2, v + height + depth);
  const back = face(u + width + depth * 2, v + depth, u + width * 2 + depth * 2, v + height + depth);

  const ordered = [
    [right[3], right[2], right[0], right[1]],
    [left[3], left[2], left[0], left[1]],
    [top[3], top[2], top[0], top[1]],
    [bottom[0], bottom[1], bottom[3], bottom[2]],
    [front[3], front[2], front[0], front[1]],
    [back[3], back[2], back[0], back[1]],
  ];

  const attribute = box.attributes.uv as THREE.BufferAttribute;
  attribute.set(new Float32Array(ordered.flat(2)));
  attribute.needsUpdate = true;
}

function createPlayer(texture: THREE.Texture, slim: boolean) {
  const shared = { map: texture, roughness: 0.78, metalness: 0, envMapIntensity: 1.15 };
  const inner = new THREE.MeshStandardMaterial({ ...shared, side: THREE.FrontSide });
  const outer = new THREE.MeshStandardMaterial({
    ...shared,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 1e-5,
  });

  const offset = (material: THREE.MeshStandardMaterial) => {
    const clone = material.clone();
    clone.polygonOffset = true;
    clone.polygonOffsetFactor = 1;
    clone.polygonOffsetUnits = 1;
    return clone;
  };

  const innerLimb = offset(inner);
  const outerLimb = offset(outer);

  const geometries: THREE.BufferGeometry[] = [];
  const materials = [inner, outer, innerLimb, outerLimb];

  const box = (
    width: number,
    height: number,
    depth: number,
    u: number,
    v: number,
    uvWidth = width,
    uvHeight = height,
    uvDepth = depth,
  ) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    unwrap(geometry, u, v, uvWidth, uvHeight, uvDepth);
    geometries.push(geometry);
    return geometry;
  };

  const at = (mesh: THREE.Mesh, y: number) => {
    mesh.position.y = y;
    return mesh;
  };

  const root = new THREE.Group();
  const arm = slim ? 3 : 4;

  root.add(
    at(new THREE.Mesh(box(8, 8, 8, 0, 0), inner), 4),
    at(new THREE.Mesh(box(9, 9, 9, 32, 0, 8, 8, 8), outer), 4),
    at(new THREE.Mesh(box(8, 12, 4, 16, 16), inner), -6),
    at(new THREE.Mesh(box(8.5, 12.5, 4.5, 16, 32, 8, 12, 4), outer), -6),
  );

  const limb = (
    width: number,
    u: number,
    v: number,
    overlayU: number,
    overlayV: number,
    pivot: [number, number],
    place: [number, number, number],
  ) => {
    const joint = new THREE.Group();
    joint.add(
      new THREE.Mesh(box(width, 12, 4, u, v), innerLimb),
      new THREE.Mesh(box(width + 0.5, 12.5, 4.5, overlayU, overlayV, width, 12, 4), outerLimb),
    );
    joint.position.set(pivot[0], pivot[1], 0);

    const group = new THREE.Group();
    group.add(joint);
    group.position.set(...place);
    root.add(group);
    return group;
  };

  const offsetX = slim ? 0.5 : 1;
  const rightArm = limb(arm, 40, 16, 40, 32, [-offsetX, -4], [-5, -2, 0]);
  const leftArm = limb(arm, 32, 48, 48, 48, [offsetX, -4], [5, -2, 0]);
  limb(4, 0, 16, 0, 32, [0, -6], [-1.9, -12, -0.1]);
  limb(4, 16, 48, 0, 48, [0, -6], [1.9, -12, -0.1]);

  return {
    root,
    rightArm,
    leftArm,
    dispose: () => {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}

function inferSlim(canvas: HTMLCanvasElement): boolean {
  const scale = canvas.width / SKIN;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;

  const transparent = (x: number, y: number, w: number, h: number) => {
    const { data } = context.getImageData(x * scale, y * scale, w * scale, h * scale);
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) return true;
    return false;
  };

  return (
    transparent(50, 16, 2, 4) ||
    transparent(54, 20, 2, 12) ||
    transparent(42, 48, 2, 4) ||
    transparent(46, 52, 2, 12)
  );
}

type Skin = { texture: THREE.Texture; slim: boolean };

const cache = new Map<string, Promise<Skin>>();

function loadSkin(url: string): Promise<Skin> {
  let skin = cache.get(url);
  if (skin) return skin;

  skin = new Promise<Skin>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d", { willReadFrequently: true })!.drawImage(image, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      resolve({ texture, slim: inferSlim(canvas) });
    };

    image.onerror = () => reject(new Error(`could not load the skin at ${url}`));
    image.src = url;
  });

  cache.set(url, skin);
  return skin;
}

export function Character({ skin: url }: { skin: string }) {
  const skin = use(loadSkin(url));
  const model = createPlayer(skin.texture, skin.slim);
  const age = useRef(0);

  useEffect(() => model.dispose, [model]);

  useFrame((_, delta) => {
    age.current += Math.min(delta, 0.1) * TPS;

    const out = Math.cos(age.current * 0.09) * 0.05 + 0.05;
    const forward = Math.sin(age.current * 0.067) * 0.05;

    model.rightArm.rotation.set(forward, 0, -out);
    model.leftArm.rotation.set(-forward, 0, out);
  });

  return (
    <group position={[0, FEET * PIXEL, 0]} scale={PIXEL}>
      <primitive object={model.root} />
    </group>
  );
}
