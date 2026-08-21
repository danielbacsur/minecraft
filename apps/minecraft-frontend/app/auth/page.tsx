"use client";

import { useEffect, useState } from "react";

import { auth } from "@minecraft/auth/react";

const PROVIDERS = [
  { id: "google", label: "Google", Mark: Google },
  { id: "discord", label: "Discord", Mark: Discord },
  { id: "microsoft", label: "Microsoft", Mark: Microsoft },
] as const;

export default function Page() {
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLastUsed(auth.getLastUsedLoginMethod());
    setFailed(new URLSearchParams(window.location.search).has("error"));
  }, []);

  const ordered = [...PROVIDERS].sort(
    (a, b) => Number(b.id === lastUsed) - Number(a.id === lastUsed),
  );

  return (
    <main className="grid min-h-dvh place-items-center bg-[#e3edf2] px-4">
      <div className="glass w-full max-w-105 rounded-3xl p-6 shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] sm:p-8">
        <h1 className="text-[18px] tracking-[0.01em] text-[rgb(70_88_115/0.78)]">
          Sign in to keep making skins
        </h1>

        <p className="mt-2 text-[14px] leading-normal text-[rgb(70_88_115/0.55)]">
          A free account gives you three new skins every day.
        </p>

        {failed && (
          <p className="mt-4 rounded-[14px] border border-white/60 bg-white/50 px-3 py-2 text-[13px] leading-normal text-[rgb(70_88_115/0.7)]">
            That sign-in did not go through. Try again, or pick a different
            account below.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          {ordered.map(({ id, label, Mark }) => (
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
              className="glass hover:glass-lit flex h-13 items-center gap-3 rounded-[18px] px-4 text-[15px] text-[rgb(70_88_115/0.78)] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,transform] duration-150 ease-out active:translate-y-0.5 motion-reduce:transition-none"
            >
              <span className="flex w-8 shrink-0 justify-center text-[rgb(70_88_115/0.5)]">
                <Mark />
              </span>

              <span className="flex-1 text-left">Continue with {label}</span>

              {id === lastUsed && (
                <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] tracking-[0.02em] text-[rgb(70_88_115/0.5)]">
                  Last used
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-5 border-t border-[rgb(120_140_160/0.12)] pt-4 text-[13px] leading-[1.6] text-[rgb(70_88_115/0.55)]">
          Using a Microsoft child account? Microsoft keeps those from signing in
          to other apps until a parent allows it at account.live.com/mk. Google
          and Discord work exactly the same here, so pick whichever you already
          have.
        </p>
      </div>
    </main>
  );
}

function Google() {
  return (
    <svg
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
