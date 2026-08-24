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

export default async function Page({ searchParams }: PageProps<"/pricing">) {
  const { error } = await searchParams;

  const failure = typeof error === "string" ? ERRORS[error] : undefined;

  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  });

  const subscribed = Boolean(session?.subscription);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#e3edf2] px-4">
      <div className="glass w-full max-w-105 rounded-3xl p-6 shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] sm:p-8">
        <h1 className="text-[18px] tracking-[0.01em] text-[rgb(70_88_115/0.78)]">
          {subscribed ? "You are on Unlimited" : "Minecraft Unlimited"}
        </h1>

        <p className="mt-2 text-[14px] leading-normal text-[rgb(70_88_115/0.55)]">
          {subscribed
            ? "Thank you. Every skin you make is yours to download."
            : "$4.99 a month. Cancel any time."}
        </p>

        {failure && (
          <p className="mt-4 rounded-[14px] border border-white/60 bg-white/50 px-3 py-2 text-[13px] leading-normal text-[rgb(70_88_115/0.7)]">
            {failure}
          </p>
        )}

        <ul className="mt-5 flex flex-col gap-2.5 text-[14px] leading-normal text-[rgb(70_88_115/0.7)]">
          <li>As many skins as you like, with no daily limit.</li>
          <li>Download the 64x64 .png and put it straight into Minecraft.</li>
          <li>Shown in your own currency at checkout.</li>
        </ul>

        <form
          action={subscribed ? "/api/stripe/portal" : "/api/stripe/checkout"}
          method="post"
          className="mt-5"
        >
          <button
            type="submit"
            className="glass hover:glass-lit flex h-13 w-full items-center justify-center rounded-[18px] px-4 text-[15px] text-[rgb(70_88_115/0.78)] shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,transform] duration-150 ease-out active:translate-y-0.5 motion-reduce:transition-none"
          >
            {subscribed ? "Manage billing" : "Go Unlimited"}
          </button>
        </form>

        <p className="mt-5 border-t border-[rgb(120_140_160/0.12)] pt-4 text-[13px] leading-[1.6] text-[rgb(70_88_115/0.55)]">
          {subscribed
            ? "Cancelling keeps Unlimited running until the end of the month you have paid for. "
            : "Ask a grown-up first — it is a real payment. "}

          <Link href="/" className="underline underline-offset-4">
            Back to the generator
          </Link>
        </p>
      </div>
    </main>
  );
}
