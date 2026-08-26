import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@minecraft/auth/server";

const ERRORS: Record<string, string> = {
  plan: "There is nothing to subscribe to right now. Try again later.",
  checkout: "We could not open the payment page. Nothing was charged.",
  portal: "We could not open your billing page. Try again in a moment.",
  callback:
    "Your payment went through. Unlimited can take a moment to show up here.",
};

const LINK = "underline underline-offset-4 hover:text-[rgb(70_88_115/0.7)]";

export default async function Page({ searchParams }: PageProps<"/pricing">) {
  const { error } = await searchParams;

  const failure = typeof error === "string" ? ERRORS[error] : undefined;

  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  });

  const subscribed = Boolean(session?.subscription);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#e3edf2] px-6 py-16 font-sans">
      <div className="w-full max-w-88 text-center">
        <h1 className="font-(family-name:--font-minecraft) text-[16px] tracking-[0.01em] text-[rgb(70_88_115/0.55)]">
          {subscribed ? "You are on Unlimited" : "Unlimited"}
        </h1>

        <p className="mt-6 font-(family-name:--font-minecraft) text-[52px] leading-none text-[rgb(70_88_115/0.85)]">
          $4.99
        </p>

        <p className="mt-2.5 font-(family-name:--font-minecraft) text-[13px] tracking-[0.02em] text-[rgb(70_88_115/0.35)]">
          per month
        </p>

        <ul className="mx-auto mt-8 flex w-fit flex-col gap-3.5 text-left text-[15px] leading-none text-[rgb(70_88_115/0.72)]">
          <li className="flex items-center gap-3.5">
            <span className="text-[rgb(104_152_112)]">
              <Tick />
            </span>
            Unlimited generations and downloads
          </li>

          <li className="flex items-center gap-3.5 [word-spacing:1px]">
            <span className="text-[rgb(104_152_112)]">
              <Tick />
            </span>
            Our highest quality generation model
          </li>
        </ul>

        {failure && (
          <p className="mt-7 text-[13px] leading-relaxed text-[rgb(70_88_115/0.7)]">
            {failure}
          </p>
        )}

        <form
          action={subscribed ? "/api/stripe/portal" : "/api/stripe/checkout"}
          method="post"
          className="mt-9"
        >
          <button
            type="submit"
            className="flex h-13 w-full items-center justify-center rounded-[18px] glass px-4 text-[15px] text-[rgb(70_88_115/0.85)] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,transform] duration-150 ease-out hover:glass-lit active:translate-y-0.5 motion-reduce:transition-none"
          >
            {subscribed ? "Manage billing" : "Go Unlimited"}
          </button>
        </form>

        <p className="mt-4 text-[12px] leading-relaxed text-[rgb(70_88_115/0.42)]">
          By subscribing you agree to our{" "}
          <Link href="/terms" className={LINK}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={LINK}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function Tick() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 7 7"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2z" />
      <path d="M3 4h1v1H3zM4 3h1v1H4zM5 2h1v1H5zM6 1h1v1H6z" />
    </svg>
  );
}
