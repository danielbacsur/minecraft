"use client";

import { PerformanceMonitor as _PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export const DPR =
  typeof window === "undefined" ? 2 : Math.min(window.devicePixelRatio * 2, 4);

export function PerformanceMonitor() {
  const setDpr = useThree((state) => state.setDpr);
  const native = () => setDpr(window.devicePixelRatio);

  return (
    <_PerformanceMonitor
      ms={500}
      factor={1}
      flipflops={1}
      iterations={16}
      onDecline={native}
      onFallback={native}
      bounds={() => [45, Infinity]}
    />
  );
}
