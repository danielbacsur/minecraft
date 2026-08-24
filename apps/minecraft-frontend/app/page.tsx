"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { auth } from "@minecraft/auth/react";

import type { Failure } from "@/errors";
import { generate } from "./_utils/generate";
import { Download } from "./_components/download";
import { Paywall } from "./_components/paywall";
import { Prompt } from "./_components/prompt";
import { Backdrop, HORIZON } from "./_components/scene/backdrop";
import { CAMERA, CameraControls, FOCUS } from "./_components/scene/camera";
import { Character, type CharacterRef } from "./_components/scene/character";
import { Ground } from "./_components/scene/ground";
import { Environment } from "./_components/scene/environment";
import { DPR, PerformanceMonitor } from "./_components/scene/performance";
import { World } from "./_components/scene/world";

type Hint = Exclude<
  Failure["code"],
  "QUOTA_EXHAUSTED" | "SUBSCRIPTION_REQUIRED"
>;

const COPY: Record<Hint, string> = {
  BAD_REQUEST: "Enter a description to make a skin.",
  UNAUTHENTICATED: "Your session could not be started. Reload the page.",
  NOT_FOUND: "That skin is not available.",
  NO_MATCH: "No skin matched that description. Try different words.",
  RATE_LIMITED: "Too many requests. Wait a moment before trying again.",
  TEXTURE_MISSING: "That skin could not be loaded.",
  RENDER_FAILED: "The skin could not be finished.",
  INTERNAL: "Something went wrong. Try again.",
  TRANSLATION_FAILED: "That description could not be read. Try again.",
  SEARCH_FAILED: "Skin search is unavailable. Try again.",
  CAPACITY: "The service is busy. Try again in a moment.",
  NETWORK_FAILED: "The connection was lost. Try again.",
};

export default function Page() {
  const { data: session } = auth.useSession();

  const subscribed = session?.subscription?.status === "active";

  const character = useRef<CharacterRef>(null);

  const [failure, setFailure] = useState<Failure | null>(null);
  const [last, setLast] = useState("");
  const [id, setId] = useState<string | null>(null);

  async function run(prompt: string, retried: boolean): Promise<void> {
    if (!character.current) return;

    const result = await generate(prompt, character.current.paint);

    if ("aborted" in result) return;

    if (result.ok) {
      setFailure(null);
      setId(result.id);
      return;
    }

    if (result.failure.code === "UNAUTHENTICATED" && !retried) {
      await auth.signIn.anonymous().catch(() => {});
      return run(prompt, true);
    }

    setFailure(result.failure);
  }

  function start(prompt: string) {
    setLast(prompt);
    setFailure(null);

    run(prompt, false).catch(() =>
      setFailure({
        code: "INTERNAL",
        message: "The generation request threw before completing.",
      }),
    );
  }

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

      {failure?.code === "QUOTA_EXHAUSTED" ? (
        <Paywall scope={failure.scope} onDismiss={() => setFailure(null)} />
      ) : failure?.code === "SUBSCRIPTION_REQUIRED" ? (
        <Paywall scope="subscription" onDismiss={() => setFailure(null)} />
      ) : null}

      <Download id={id} subscribed={subscribed} onFailure={setFailure} />

      <Prompt
        hint={
          failure &&
          failure.code !== "QUOTA_EXHAUSTED" &&
          failure.code !== "SUBSCRIPTION_REQUIRED" ? (
            <>
              {COPY[failure.code]}
              <button
                type="button"
                onClick={() => start(last)}
                className="underline underline-offset-4 hover:text-[rgb(70_88_115/0.95)]"
              >
                Try again
              </button>
            </>
          ) : null
        }
        onSubmit={({ query }) => start(query)}
      />
    </div>
  );
}
