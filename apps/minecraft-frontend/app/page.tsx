"use client";

import { Suspense, useRef, useState } from "react";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { auth } from "@minecraft/auth/react";

import type { Failure } from "@/errors";

import { Download } from "./_components/download";
import { Legal } from "./_components/legal";
import { Paywall } from "./_components/paywall";
import { Prompt } from "./_components/prompt";
import { Backdrop, HORIZON } from "./_components/scene/backdrop";
import { CAMERA, CameraControls, FOCUS } from "./_components/scene/camera";
import { Character, type CharacterRef } from "./_components/scene/character";
import { Environment } from "./_components/scene/environment";
import { Ground } from "./_components/scene/ground";
import { DPR, PerformanceMonitor } from "./_components/scene/performance";
import { World } from "./_components/scene/world";
import { generate } from "./_utils/generate";

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

  const hint =
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
    ) : null;

  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-[#e3edf2] font-sans">
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

      <div className="fixed inset-x-0 bottom-2.5 z-10 touch-auto px-9">
        <div className="mb-2.5 grid">
          <p
            className={`col-start-1 row-start-1 text-center text-[11px] leading-[1.5] text-balance text-[rgb(70_88_115/0.4)] transition-opacity duration-200 ease-out [text-shadow:0_1px_0_rgb(255_255_255/0.7)] motion-reduce:transition-none ${hint ? "opacity-0" : "opacity-100"}`}
          >
            NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED
            WITH MOJANG OR MICROSOFT.
          </p>

          <p
            className={`col-start-1 row-start-1 flex items-center justify-center gap-2 text-center font-(family-name:--font-minecraft) text-[13px] leading-relaxed text-[rgb(70_88_115/0.72)] transition-opacity duration-200 ease-out [text-shadow:0_1px_0_rgb(255_255_255/0.8)] motion-reduce:transition-none ${hint ? "opacity-100" : "opacity-0"}`}
          >
            {hint}
          </p>
        </div>

        <Prompt onSubmit={({ query }) => start(query)} />

        <Legal />
      </div>
    </div>
  );
}
