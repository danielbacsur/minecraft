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
    <main className="relative grid min-h-dvh place-items-center px-6 py-16">
      <div className="relative w-full max-w-sm animate-emerge text-center motion-reduce:animate-none">
        <h1 className="text-xl">{reason?.title ?? dictionary.title}</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {reason?.subtitle ?? dictionary.subtitle}
        </p>

        {failed && (
          <p className="mt-6 text-sm text-muted-foreground">
            {dictionary.failure}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-2">
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
              className="flex h-14 items-center gap-4 rounded-full glass px-6 text-base transition active:translate-y-px motion-reduce:transition-none"
            >
              <Mark className="size-4 shrink-0 text-muted-foreground" />

              <span className="min-w-0 flex-1 truncate text-left">
                {dictionary.continueWith[id]}
              </span>

              {id === lastUsed && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {dictionary.lastUsed}
                </span>
              )}
            </button>
          ))}
        </div>

        <Agreement
          copy={dictionary.agreement}
          locale={locale}
          className="mt-4 text-xs text-muted-foreground"
        />
      </div>
    </main>
  );
}
