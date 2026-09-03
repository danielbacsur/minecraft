"use client";

import { useSyncExternalStore } from "react";

import { FaDiscord, FaGoogle, FaMicrosoft } from "react-icons/fa6";

import { auth } from "@minecraft/auth/react";

import type { Locale } from "@/utils/i18n";

import type { Dictionary } from "../_dictionaries";
import { Agreement } from "../../_components/agreement";

const PROVIDERS = [
  { id: "google", Mark: FaGoogle },
  { id: "discord", Mark: FaDiscord },
  { id: "microsoft", Mark: FaMicrosoft },
] as const;

const settled = () => () => {};

export function Client({
  dictionary,
  locale,
  reason,
}: {
  dictionary: Dictionary["page"];
  locale: Locale;
  reason: { title: string; subtitle: string } | null;
}) {
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
    <main className="relative grid min-h-dvh place-items-center px-6 py-16 font-sans">
      <div className="relative w-full max-w-88 animate-emerge motion-reduce:animate-none">
        <h1 className="text-center text-[16px] tracking-[0.01em] text-[rgb(70_88_115/0.7)]">
          {reason?.title ?? dictionary.title}
        </h1>

        <p className="mt-2 text-center text-[13px] leading-relaxed text-[rgb(70_88_115/0.5)]">
          {reason?.subtitle ?? dictionary.subtitle}
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
              className="flex h-13 items-center gap-3 rounded-full glass px-4 text-[15px] text-[rgb(70_88_115/0.85)] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,transform] duration-150 ease-out hover:glass-lit active:translate-y-0.5 motion-reduce:transition-none"
            >
              <span className="flex w-8 shrink-0 justify-center text-[rgb(70_88_115/0.5)]">
                <Mark className="size-4" />
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
          locale={locale}
          className="mt-5 text-center text-[12px] leading-relaxed text-[rgb(70_88_115/0.42)]"
        />
      </div>
    </main>
  );
}
