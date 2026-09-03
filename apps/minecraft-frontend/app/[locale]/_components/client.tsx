"use client";

import { use, useState } from "react";

import { useRouter } from "next/navigation";

import { auth } from "@minecraft/auth/react";

import type { Failure } from "@/errors";
import type { Locale } from "@/utils/i18n";

import type { Dictionary } from "../_dictionaries";
import { generate } from "../_utils/generate";
import { Download } from "./download";
import { Legal } from "./legal";
import { Nav } from "./nav";
import { Prompt } from "./prompt";
import { CharacterContext } from "./studio";

const REASON = {
  BAD_REQUEST: "words",
  CAPACITY: "wait",
  INTERNAL: "retry",
  NETWORK_FAILED: "retry",
  NO_MATCH: "words",
  NOT_FOUND: "retry",
  RATE_LIMITED: "wait",
  RENDER_FAILED: "retry",
  SEARCH_FAILED: "retry",
  TEXTURE_MISSING: "retry",
  TRANSLATION_FAILED: "retry",
  UNAUTHENTICATED: "reload",
} as const satisfies Record<
  Exclude<Failure["code"], "QUOTA_EXHAUSTED" | "SUBSCRIPTION_REQUIRED">,
  "retry" | "wait" | "words" | "reload"
>;

export function Client({
  dictionary,
  locale,
}: {
  dictionary: Dictionary["page"];
  locale: Locale;
}) {
  const { data: session } = auth.useSession();
  const router = useRouter();

  const subscribed = session?.subscription?.status === "active";
  const registered = Boolean(session && !session.user.isAnonymous);

  const character = use(CharacterContext);

  const [failure, setFailure] = useState<Failure | null>(null);
  const [last, setLast] = useState("");
  const [id, setId] = useState<string | null>(null);

  function report(failure: Failure) {
    if (failure.code === "SUBSCRIPTION_REQUIRED") {
      return router.push(`/${locale}/pricing?from=download`);
    }

    if (failure.code === "QUOTA_EXHAUSTED") {
      return router.push(
        failure.scope === "anonymous"
          ? `/${locale}/auth?from=quota`
          : `/${locale}/pricing?from=quota`,
      );
    }

    setFailure(failure);
  }

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

    report(result.failure);
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

  const notice = failure
    ? dictionary.errors[REASON[failure.code as keyof typeof REASON]]
        .split(/(\{retry\})/)
        .map((part, index) =>
          part === "{retry}" ? (
            <button
              key={index}
              type="button"
              onClick={() => start(last)}
              className="underline underline-offset-4 transition-colors hover:text-foreground motion-reduce:transition-none"
            >
              {dictionary.retry}
            </button>
          ) : (
            part
          ),
        )
    : null;

  return (
    <div className="pointer-events-none relative h-dvh w-full overflow-hidden">
      <Nav copy={dictionary.nav} locale={locale} registered={registered}>
        <Download
          copy={dictionary.download}
          id={id}
          subscribed={subscribed}
          onFailure={report}
        />
      </Nav>

      <div className="pointer-events-auto fixed inset-x-0 bottom-4 z-10 touch-auto px-6">
        <div className="mb-2 grid">
          <p
            className={`col-start-1 row-start-1 text-center text-xs text-balance text-muted-foreground transition-opacity text-shadow-2xs text-shadow-white/70 motion-reduce:transition-none ${notice ? "opacity-0" : "opacity-100"}`}
          >
            {dictionary.disclaimer}
          </p>

          <p
            className={`col-start-1 row-start-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-base font-medium transition-opacity text-shadow-2xs text-shadow-white/70 motion-reduce:transition-none ${notice ? "opacity-100" : "opacity-0"}`}
          >
            {notice}
          </p>
        </div>

        <Prompt
          copy={dictionary.prompt}
          onSubmit={({ query }) => start(query)}
        />

        <Legal copy={dictionary.legal} locale={locale} />
      </div>
    </div>
  );
}
