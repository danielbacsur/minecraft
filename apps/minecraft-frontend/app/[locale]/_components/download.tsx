"use client";

import { useState } from "react";

import { LuLock } from "react-icons/lu";

import type { Failure } from "@/errors";

export function Download({
  copy,
  id,
  subscribed,
  onFailure,
}: {
  copy: { subscribedTitle: string; lockedTitle: string; label: string };
  id: string | null;
  subscribed: boolean;
  onFailure: (failure: Failure) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!id) return;
    setBusy(true);

    try {
      const response = await fetch(`/api/download?id=${id}`);

      if (!response.ok) {
        const failure = (await response.json().catch(() => null)) as Failure;

        return onFailure(
          failure ?? {
            code: "NETWORK_FAILED",
            message: "The download request did not complete.",
          },
        );
      }

      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${id}.png`;
      anchor.click();

      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={!id || busy}
      title={subscribed ? copy.subscribedTitle : copy.lockedTitle}
      onClick={save}
      className="pointer-events-auto fixed end-4 top-4 z-10 flex h-11 items-center gap-2 rounded-full glass px-4 text-base transition disabled:opacity-40 motion-reduce:transition-none"
    >
      {!subscribed && <LuLock className="size-4 text-muted-foreground" />}
      {copy.label}
    </button>
  );
}
