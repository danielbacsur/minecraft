"use client";

import { ContactShadows, Grid } from "@react-three/drei";

export function Ground() {
  return (
    <>
      <Grid
        position={[0, -0.005, 0]}
        renderOrder={1}
        args={[2.5, 2.5]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#c2d3dc"
        sectionSize={16}
        sectionThickness={1}
        sectionColor="#8aa7b8"
        fadeDistance={120}
        fadeStrength={2.5}
        infiniteGrid
      />

      <ContactShadows
        renderOrder={2}
        scale={8}
        far={2.4}
        blur={2}
        opacity={0.85}
        resolution={1024}
        color="#2f4a58"
      />
    </>
  );
}
