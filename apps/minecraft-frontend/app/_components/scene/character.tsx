"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PIXEL = 0.9375 / 16;
const FEET = 24;
const SKIN = 64;
const REST = Math.PI * 0.02;
const REGIONS = [
  [50, 16, 2, 4],
  [54, 20, 2, 12],
  [42, 48, 2, 4],
  [46, 52, 2, 12],
];

export type CharacterRef = { paint: (source: CanvasImageSource) => void };

type Joint = {
  w: number; h: number; d: number;
  u: number; v: number; s: number; t: number;
  x: number; y: number; i: number; j: number;
  ref: Ref<THREE.Group>;
}; // prettier-ignore

export function Character({ ref }: { ref?: Ref<CharacterRef> }) {
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const [slim, setSlim] = useState(false);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SKIN;

  const context = canvas.getContext("2d", { willReadFrequently: true })!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  const inner = new THREE.MeshStandardMaterial();
  inner.map = texture;
  inner.roughness = 0.78;
  inner.envMapIntensity = 1.15;

  const outer = inner.clone();
  outer.side = THREE.DoubleSide;
  outer.transparent = true;
  outer.alphaTest = 1e-5;

  const innerLimb = inner.clone();
  innerLimb.polygonOffset = true;
  innerLimb.polygonOffsetFactor = 1;
  innerLimb.polygonOffsetUnits = 2;

  const outerLimb = outer.clone();
  outerLimb.polygonOffset = true;
  outerLimb.polygonOffsetFactor = 1;
  outerLimb.polygonOffsetUnits = 1;

  const paint = (source: CanvasImageSource) => {
    context.clearRect(0, 0, SKIN, SKIN);
    context.drawImage(source, 0, 0, SKIN, SKIN);
    texture.needsUpdate = true;

    const getPixels = (x: number, y: number, w: number, h: number) =>
      context.getImageData(x, y, w, h).data;

    const hasAlpha = (pixels: Uint8ClampedArray) =>
      pixels.some((value, i) => i % 4 === 3 && value > 0);

    const hasTransparency = (pixels: Uint8ClampedArray) =>
      pixels.some((value, i) => i % 4 === 3 && value < 255);

    const isSolidBlack = (pixels: Uint8ClampedArray) =>
      pixels.every((value, i) => value === (i % 4 === 3 ? 255 : 0));

    const isSolidWhite = (pixels: Uint8ClampedArray) =>
      pixels.every((value) => value === 255);

    const regions = REGIONS.map(([x, y, w, h]) => getPixels(x, y, w, h));

    // prettier-ignore
    const isSlim = hasAlpha(getPixels(44, 20, 2, 12)) && (
      regions.some(hasTransparency) ||
      regions.every(isSolidBlack) ||
      regions.every(isSolidWhite)
    );

    setSlim(isSlim);
  };

  useImperativeHandle(ref, () => ({ paint }));

  useEffect(() => {
    const image = new Image();
    image.onload = () => paint(image);
    image.src = "/resources/client/minecraft/textures/entity/player/wide/steve.png"; // prettier-ignore

    return () => {
      image.onload = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the compiler caches these for the component's lifetime
  }, [texture]);

  useEffect(
    () => () => {
      for (const resource of [texture, inner, outer, innerLimb, outerLimb])
        resource.dispose();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the compiler caches these for the component's lifetime
    [texture],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 2;
    rightArm.current!.rotation.z = Math.cos(time + Math.PI) * 0.03 - REST;
    leftArm.current!.rotation.z = Math.cos(time) * 0.03 + REST;
  });

  const [arm, ax] = slim ? [3, 0.5] : [4, 1];

  // prettier-ignore
  const joints: Joint[] = [
    { w: 8, h: 8, d: 8, u: 0, v: 0, s: 32, t: 0, x: 0, y: 0,  i: 0, j: 4, ref: head },
    { w: 8, h: 12, d: 4, u: 16, v: 16, s: 16, t: 32, x: 0, y: 0, i: 0, j: -6, ref: body },
    { w: arm, h: 12, d: 4, u: 40, v: 16, s: 40, t: 32, x: -5, y: -2, i: -ax, j: -4, ref: rightArm },
    { w: arm, h: 12, d: 4, u: 32, v: 48, s: 48, t: 48, x: 5, y: -2, i: ax, j: -4, ref: leftArm },
    { w: 4, h: 12, d: 4, u: 0, v: 16, s: 0, t: 32, x: -2, y: -12, i: 0, j: -6, ref: rightLeg },
    { w: 4, h: 12, d: 4, u: 16, v: 48, s: 0, t: 48, x: 2, y: -12, i: 0, j: -6, ref: leftLeg },
  ];

  return (
    <group position={[0, FEET * PIXEL, 0]} scale={PIXEL}>
      {joints.map(({ w, h, d, u, v, s, t, x, y, i, j, ref }, key) => {
        const inflate = j > 0 ? 1 : 0.5;
        const centre = x + i;
        const overhang = (w + inflate) / 2 - Math.abs(centre);
        const clip = centre === 0 ? 0 : Math.max(0, overhang);

        const geometry = (u: number, v: number) => {
          const uv: number[] = [];

          const face = (x1: number, y1: number, x2: number, y2: number) => {
            uv.push(
              x1 / SKIN, 1 - y1 / SKIN, x2 / SKIN, 1 - y1 / SKIN,
              x1 / SKIN, 1 - y2 / SKIN, x2 / SKIN, 1 - y2 / SKIN,
            ); // prettier-ignore
          };

          const [near, far] = [v + d, v + d + h];

          face(u + w + d, near, u + w + d * 2, far);
          face(u, near, u + d, far);
          face(u + d, v, u + w + d, near);
          face(u + w + d, near, u + w * 2 + d, v);
          face(u + d, near, u + w + d, far);
          face(u + w + d * 2, near, u + w * 2 + d * 2, far);

          const box = new THREE.BoxGeometry(w, h, d);
          box.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
          return box;
        };

        const shell = geometry(s, t);
        shell.scale((w + inflate - clip) / w, (h + inflate) / h, (d + inflate) / d); // prettier-ignore
        shell.translate((Math.sign(centre) * clip) / 2, 0, 0);

        return (
          <group key={key} ref={ref} position={[x, y, 0]}>
            <mesh
              geometry={geometry(u, v)}
              material={y ? innerLimb : inner}
              position={[i, j, 0]}
            />
            <mesh
              geometry={shell}
              material={y ? outerLimb : outer}
              position={[i, j, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}
