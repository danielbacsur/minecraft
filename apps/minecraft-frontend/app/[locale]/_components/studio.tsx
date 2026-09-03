"use client";

import {
  createContext,
  Suspense,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { Backdrop, HORIZON } from "./scene/backdrop";
import { CAMERA, CameraControls, DISTANT, FOCUS } from "./scene/camera";
import { Character, type CharacterRef } from "./scene/character";
import { Environment } from "./scene/environment";
import { Ground } from "./scene/ground";
import { DPR, PerformanceMonitor } from "./scene/performance";
import { World } from "./scene/world";

const VIGNETTE =
  "radial-gradient(ellipse 600px 540px at 50% 50%, #000 0%, #000 38%, transparent 100%)";

export const CharacterContext = createContext<{
  current: CharacterRef | null;
}>({ current: null });

function useStage() {
  const pathname = usePathname();
  const page = pathname.split("/").filter(Boolean)[1];

  if (!page) return "stage";
  if (page === "auth" || page === "pricing") return "backdrop";

  return "hidden";
}

export function Studio({ children }: { children: ReactNode }) {
  const character = useRef<CharacterRef>(null);
  const stage = useStage();
  const [entered] = useState(stage);

  return (
    <CharacterContext value={character}>
      <div
        aria-hidden={stage !== "stage"}
        className={`fixed inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
          stage === "hidden" ? "opacity-0" : "opacity-100"
        } ${stage === "stage" ? "touch-none" : "pointer-events-none"}`}
      >
        <Canvas
          dpr={DPR}
          camera={entered === "stage" ? CAMERA : DISTANT}
          frameloop={stage === "hidden" ? "never" : "always"}
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

          <CameraControls distant={stage !== "stage"} />
          <PerformanceMonitor />
        </Canvas>
      </div>

      <div
        aria-hidden="true"
        style={{
          maskImage: VIGNETTE,
          WebkitMaskImage: VIGNETTE,
        }}
        className={`pointer-events-none fixed inset-0 bg-background/90 backdrop-blur-md transition-opacity duration-700 motion-reduce:transition-none ${
          stage === "backdrop" ? "opacity-100" : "opacity-0"
        }`}
      />

      {children}
    </CharacterContext>
  );
}
