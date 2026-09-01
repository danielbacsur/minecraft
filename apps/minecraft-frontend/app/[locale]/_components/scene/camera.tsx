"use client";

import { useEffect, useRef } from "react";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export const FOCUS = [0, 0.9375, 0] as const;

export const CAMERA = {
  fov: 50,
  near: 0.1,
  far: 400,
  position: [0, 1.6, 3.9],
} as const;

const NEAR = 3.956;
const FAR = 9;

export const DISTANT = {
  ...CAMERA,
  position: [0, 2.445, 8.873],
} as const;

const DURATION = 1.1;

const base = new THREE.Quaternion();
const drift = new THREE.Quaternion();
const euler = new THREE.Euler();
const offset = new THREE.Vector3();

const ease = (step: number) =>
  step < 0.5 ? 4 * step ** 3 : 1 - (-2 * step + 2) ** 3 / 2;

export function CameraControls({ distant }: { distant: boolean }) {
  const controls = useThree((state) => state.controls) as {
    target: THREE.Vector3;
  } | null;

  const home = useRef(NEAR);
  const tween = useRef<{ from: number | null; to: number; elapsed: number } | null>(null); // prettier-ignore
  const started = useRef(false);
  const active = useRef(distant);

  useEffect(() => {
    if (started.current) {
      tween.current = {
        from: null,
        to: distant ? FAR : home.current,
        elapsed: 0,
      };
    }

    active.current = distant;
  }, [distant]);

  useFrame(({ camera, clock }, delta) => {
    const target = controls?.target;
    if (!target) return;

    offset.copy(camera.position).sub(target);

    if (!started.current) {
      started.current = true;
      camera.position
        .copy(target)
        .add(offset.setLength(distant ? FAR : home.current));

      return;
    }

    const moving = tween.current;

    let shake = active.current ? 0 : 1;

    if (moving) {
      moving.from ??= offset.length();

      moving.elapsed = Math.min(DURATION, moving.elapsed + delta);

      const step = ease(moving.elapsed / DURATION);
      const radius = moving.from + (moving.to - moving.from) * step;

      camera.position.copy(target).add(offset.setLength(radius));

      shake = distant ? 1 - step : step;

      if (moving.elapsed === DURATION) tween.current = null;
    } else if (!active.current) {
      home.current = offset.length();
    }

    if (shake === 0) return;

    const time = clock.elapsedTime;

    euler.set(
      (Math.sin(time * 0.31) * 0.006 + Math.sin(time * 0.17) * 0.004) * shake,
      (Math.sin(time * 0.23) * 0.009 + Math.sin(time * 0.11) * 0.006) * shake,
      Math.sin(time * 0.19) * 0.002 * shake,
    );

    base.copy(camera.quaternion);
    camera.quaternion.multiplyQuaternions(base, drift.setFromEuler(euler));
  });

  return (
    <OrbitControls
      makeDefault
      target={FOCUS}
      enablePan={false}
      enableRotate={!distant}
      enableZoom={!distant}
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
