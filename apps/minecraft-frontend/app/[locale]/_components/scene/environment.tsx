"use client";

import { Environment as _Environment, Lightformer } from "@react-three/drei";

import { HORIZON } from "./backdrop";

export function Environment() {
  return (
    <>
      <_Environment resolution={256} frames={1} environmentIntensity={1.15}>
        <color attach="background" args={[HORIZON]} />
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#ffffff"
          scale={[10, 10, 1]}
          position={[-7, 8, 7]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="circle"
          intensity={2}
          color="#eef6ff"
          scale={11}
          position={[0, 11, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.3}
          color="#b9d3e8"
          scale={[13, 7, 1]}
          position={[9, 3.5, -5]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#dbe7ee"
          scale={[16, 16, 1]}
          position={[0, -7, 0]}
        />
      </_Environment>

      <directionalLight intensity={0.85} color="#fff6ea" position={[6, 9, 4]} />
    </>
  );
}
