"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const FOCUS = [0, 0.9375, 0] as const;

export const CAMERA = {
  fov: 50,
  near: 0.1,
  far: 400,
  position: [0, 1.6, 3.9],
} as const;

const base = new THREE.Quaternion();
const drift = new THREE.Quaternion();
const euler = new THREE.Euler();

export function CameraControls() {
  useFrame(({ camera, clock }) => {
    const time = clock.elapsedTime;

    euler.set(
      Math.sin(time * 0.31) * 0.006 + Math.sin(time * 0.17) * 0.004,
      Math.sin(time * 0.23) * 0.009 + Math.sin(time * 0.11) * 0.006,
      Math.sin(time * 0.19) * 0.002,
    );

    base.copy(camera.quaternion);
    camera.quaternion.multiplyQuaternions(base, drift.setFromEuler(euler));
  });

  return (
    <OrbitControls
      makeDefault
      target={FOCUS}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.7}
      zoomSpeed={0.7}
      minDistance={1.6}
      maxDistance={14}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.02}
    />
  );
}
