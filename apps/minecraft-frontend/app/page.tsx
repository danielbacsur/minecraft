"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { Backdrop, HORIZON } from "./_components/scene/backdrop";
import { Environment } from "./_components/scene/environment";

export default function Page() {
  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-[#e3edf2]">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 1.6, 3.9] }}
        gl={{
          antialias: true,
          toneMapping: THREE.NeutralToneMapping,
          powerPreference: "high-performance",
        }}
      >
        <fogExp2 attach="fog" args={[HORIZON, 0.016]} />

        <Backdrop />
        <Environment />
      </Canvas>
    </div>
  );
}
