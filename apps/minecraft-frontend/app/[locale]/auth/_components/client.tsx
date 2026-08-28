"use client";

import { useSyncExternalStore } from "react";

import { auth } from "@minecraft/auth/react";

import type { Dictionary } from "../_dictionaries";
import { Agreement } from "../../_components/agreement";

const PROVIDERS = [
  { id: "google", Mark: Google },
  { id: "discord", Mark: Discord },
  { id: "microsoft", Mark: Microsoft },
] as const;

const settled = () => () => {};

export function Client({ dictionary }: { dictionary: Dictionary["page"] }) {
  const lastUsed = useSyncExternalStore(
    settled,
    () => auth.getLastUsedLoginMethod(),
    () => null,
  );

  const failed = useSyncExternalStore(
    settled,
    () => new URLSearchParams(window.location.search).has("error"),
    () => false,
  );

  const ordered = [...PROVIDERS].sort(
    (a, b) => Number(b.id === lastUsed) - Number(a.id === lastUsed),
  );

  return (
    <main className="grid min-h-dvh place-items-center bg-[#e3edf2] px-6 py-16 font-sans">
      <div className="w-full max-w-88">
        <h1 className="text-center font-(family-name:--font-minecraft) text-[16px] tracking-[0.01em] text-[rgb(70_88_115/0.7)]">
          {dictionary.title}
        </h1>

        <p className="mt-2 text-center text-[13px] leading-relaxed text-[rgb(70_88_115/0.5)]">
          {dictionary.subtitle}
        </p>

        {failed && (
          <p className="mt-5 text-center text-[13px] leading-relaxed text-[rgb(70_88_115/0.7)]">
            {dictionary.failure}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-2">
          {ordered.map(({ id, Mark }) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                auth.signIn.social({
                  provider: id,
                  callbackURL: "/",
                  errorCallbackURL: "/auth",
                })
              }
              className="flex h-13 items-center gap-3 rounded-[18px] glass px-4 text-[15px] text-[rgb(70_88_115/0.85)] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,transform] duration-150 ease-out hover:glass-lit active:translate-y-0.5 motion-reduce:transition-none"
            >
              <span className="flex w-8 shrink-0 justify-center text-[rgb(70_88_115/0.5)]">
                <Mark />
              </span>

              <span className="min-w-0 flex-1 truncate text-left">
                {dictionary.continueWith[id]}
              </span>

              {id === lastUsed && (
                <span className="shrink-0 text-[11px] tracking-[0.02em] text-[rgb(70_88_115/0.4)]">
                  {dictionary.lastUsed}
                </span>
              )}
            </button>
          ))}
        </div>

        <Agreement
          copy={dictionary.agreement}
          className="mt-5 text-center text-[12px] leading-relaxed text-[rgb(70_88_115/0.42)]"
        />
      </div>
    </main>
  );
}

function Google() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M2 1h4v1H2z" />
      <path d="M6 1h1v1H6z" />
      <path d="M1 2h1v4H1z" />
      <path d="M4 4h2v1H4z" />
      <path d="M6 4h1v3H6z" />
      <path d="M2 6h4v1H2z" />
    </svg>
  );
}

function Discord() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M2 1h4v1H2z" />
      <path d="M1 2h6v1H1z" />
      <path d="M1 3h2v2H1z" />
      <path d="M4 3h1v2H4z" />
      <path d="M6 3h1v2H6z" />
      <path d="M1 5h6v1H1z" />
      <path d="M0 6h2v1H0z" />
      <path d="M6 6h2v1H6z" />
    </svg>
  );
}

function Microsoft() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 7 7"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M0 0h3v3H0z" />
      <path d="M4 0h3v3H4z" />
      <path d="M0 4h3v3H0z" />
      <path d="M4 4h3v3H4z" />
    </svg>
  );
}
