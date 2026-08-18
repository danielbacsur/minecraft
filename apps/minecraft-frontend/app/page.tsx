"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { Backdrop, HORIZON } from "./_components/scene/backdrop";
import { CAMERA, CameraControls, FOCUS } from "./_components/scene/camera";
import { Character, DEFAULT_SKIN } from "./_components/scene/character";
import { Environment } from "./_components/scene/environment";

export default function Page() {
  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-[#e3edf2]">
      <Canvas
        dpr={[1, 2]}
        camera={CAMERA}
        gl={{
          antialias: true,
          toneMapping: THREE.NeutralToneMapping,
          powerPreference: "high-performance",
        }}
        onCreated={({ camera }) => camera.lookAt(...FOCUS)}
      >
        <fogExp2 attach="fog" args={[HORIZON, 0.016]} />

        <Backdrop />
        <Environment />

        <Suspense fallback={null}>
          <Character skin={DEFAULT_SKIN} />
        </Suspense>

        <CameraControls />
      </Canvas>
    </div>
  );
}
