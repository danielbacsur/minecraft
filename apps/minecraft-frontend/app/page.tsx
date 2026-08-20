"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { Prompt } from "./_components/prompt";
import { Backdrop, HORIZON } from "./_components/scene/backdrop";
import { CAMERA, CameraControls, FOCUS } from "./_components/scene/camera";
import { Character, type CharacterRef } from "./_components/scene/character";
import { Ground } from "./_components/scene/ground";
import { Environment } from "./_components/scene/environment";
import { DPR, PerformanceMonitor } from "./_components/scene/performance";
import { World } from "./_components/scene/world";
import { generate } from "./_utils/generate";

export default function Page() {
  const character = useRef<CharacterRef>(null);

  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-[#e3edf2]">
      <Canvas
        dpr={DPR}
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
        <Ground />
        <Environment />

        <Suspense fallback={null}>
          <World />
        </Suspense>

        <Suspense fallback={null}>
          <Character ref={character} />
        </Suspense>
        <CameraControls />
        <PerformanceMonitor />
      </Canvas>

      <Prompt
        onSubmit={({ query }) => {
          if (!character.current) return;
          generate(query, character.current.paint).catch(() => {});
        }}
      />
    </div>
  );
}
