"use client";

import { GradientTexture } from "@react-three/drei";
import * as THREE from "three";

export const TOP = "#f8fbfc";
export const HORIZON = "#e3edf2";
export const BOTTOM = "#d6e4ec";

export function Backdrop() {
  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[200, 32, 24]} />
      <meshBasicMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      >
        <GradientTexture
          stops={[0, 0.5, 0.75]}
          colors={[BOTTOM, HORIZON, TOP]}
          size={256}
        />
      </meshBasicMaterial>
    </mesh>
  );
}
