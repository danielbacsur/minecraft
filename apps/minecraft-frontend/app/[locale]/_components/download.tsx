"use client";

import { useState } from "react";

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
      className="flex h-11 items-center gap-2.5 rounded-full glass px-4 text-[14px] text-[rgb(70_88_115/0.78)] shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,opacity] duration-150 ease-out hover:glass-lit disabled:opacity-40 motion-reduce:transition-none"
    >
      {!subscribed && <Lock />}
      {copy.label}
    </button>
  );
}

function Lock() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 7 7"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M2 1h3v1H2z" />
      <path d="M2 2h1v1H2z" />
      <path d="M4 2h1v1H4z" />
      <path d="M1 3h5v3H1z" />
    </svg>
  );
}
