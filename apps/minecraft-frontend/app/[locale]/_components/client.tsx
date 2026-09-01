"use client";

import { Suspense, useRef, useState } from "react";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { auth } from "@minecraft/auth/react";

import type { Failure } from "@/errors";
import type { Locale } from "@/utils/i18n";

import type { Dictionary } from "../_dictionaries";
import { generate } from "../_utils/generate";
import { Download } from "./download";
import { Legal } from "./legal";
import { Paywall } from "./paywall";
import { Prompt } from "./prompt";
import { Backdrop, HORIZON } from "./scene/backdrop";
import { CAMERA, CameraControls, FOCUS } from "./scene/camera";
import { Character, type CharacterRef } from "./scene/character";
import { Environment } from "./scene/environment";
import { Ground } from "./scene/ground";
import { DPR, PerformanceMonitor } from "./scene/performance";
import { World } from "./scene/world";

type Hint = Exclude<
  Failure["code"],
  "QUOTA_EXHAUSTED" | "SUBSCRIPTION_REQUIRED"
>;

export function Client({
  dictionary,
  locale,
}: {
  dictionary: Dictionary["page"];
  locale: Locale;
}) {
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
        {dictionary.errors[failure.code as Hint]}
        <button
          type="button"
          onClick={() => start(last)}
          className="underline underline-offset-4 hover:text-[rgb(70_88_115/0.95)]"
        >
          {dictionary.retry}
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
        <Paywall
          copy={dictionary.paywall}
          locale={locale}
          scope={failure.scope}
          onDismiss={() => setFailure(null)}
        />
      ) : failure?.code === "SUBSCRIPTION_REQUIRED" ? (
        <Paywall
          copy={dictionary.paywall}
          locale={locale}
          scope="subscription"
          onDismiss={() => setFailure(null)}
        />
      ) : null}

      <Download
        copy={dictionary.download}
        id={id}
        subscribed={subscribed}
        onFailure={setFailure}
      />

      <div className="fixed inset-x-0 bottom-2.5 z-10 touch-auto px-9">
        <div className="mb-2.5 grid">
          <p
            className={`col-start-1 row-start-1 text-center text-[11px] leading-[1.5] text-balance text-[rgb(70_88_115/0.4)] transition-opacity duration-200 ease-out [text-shadow:0_1px_0_rgb(255_255_255/0.7)] motion-reduce:transition-none ${hint ? "opacity-0" : "opacity-100"}`}
          >
            {dictionary.disclaimer}
          </p>

          <p
            className={`col-start-1 row-start-1 flex items-center justify-center gap-2 text-center text-[13px] leading-relaxed text-[rgb(70_88_115/0.72)] transition-opacity duration-200 ease-out [text-shadow:0_1px_0_rgb(255_255_255/0.8)] motion-reduce:transition-none ${hint ? "opacity-100" : "opacity-0"}`}
          >
            {hint}
          </p>
        </div>

        <Prompt
          copy={dictionary.prompt}
          onSubmit={({ query }) => start(query)}
        />

        <Legal copy={dictionary.legal} />
      </div>
    </div>
  );
}
