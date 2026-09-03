import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@minecraft/auth/server";

import { hasLocale, type Locale } from "@/utils/i18n";

import { Agreement } from "../_components/agreement";
import { Back } from "../_components/nav";
import { getPriceByLocale } from "../_utils/price";
import { getDictionary } from "./_dictionaries";

function reset(locale: Locale, copy: { soon: string; later: string }) {
  const now = new Date();

  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );

  const hours = Math.round((midnight - now.getTime()) / 3_600_000);

  if (hours < 1) return copy.soon;

  return copy.later.replace(
    "{when}",
    new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      hours,
      "hour",
    ),
  );
}

const ACTION =
  "mt-10 flex h-14 w-full items-center justify-center rounded-full glass px-6 text-base transition active:translate-y-px motion-reduce:transition-none";

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  const page = dictionary.page;

  const amount = await getPriceByLocale(locale);

  const { error, from } = await searchParams;

  const reason =
    from === "download"
      ? page.reasons.download
      : from === "quota"
        ? reset(locale, page.reasons.quota)
        : null;

  const failure =
    typeof error === "string"
      ? page.errors[error as keyof typeof page.errors]
      : amount
        ? undefined
        : page.errors.plan;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const registered = Boolean(session && !session.user.isAnonymous);
  const subscribed = Boolean(session?.subscription);
  const subscription = page.subscription;
  const state = subscribed ? "subscribed" : "available";

  return (
    <main className="relative grid min-h-dvh place-items-center px-6 py-16">
      <Back copy={page.back} locale={locale} />

      <div className="relative w-full max-w-sm animate-emerge text-center motion-reduce:animate-none">
        {reason && (
          <p className="mb-6 text-sm text-muted-foreground">{reason}</p>
        )}

        <h1 className="text-sm text-muted-foreground">
          {subscription.title[state]}
        </h1>

        {amount && (
          <p className="mt-4 text-5xl">
            {subscription.price.replace("{price}", amount)}
          </p>
        )}

        {subscription.period && (
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription.period}
          </p>
        )}

        <ul className="mx-auto mt-10 flex w-fit flex-col gap-2 text-left text-base">
          {subscription.features.map((feature) => (
            <li key={feature} className="flex items-center gap-4">
              <Tick />
              {feature}
            </li>
          ))}
        </ul>

        {failure && (
          <p className="mt-6 text-sm text-muted-foreground">{failure}</p>
        )}

        {registered ? (
          <form
            action={subscribed ? "/api/stripe/portal" : "/api/stripe/checkout"}
            method="post"
          >
            <button type="submit" className={ACTION}>
              {subscription.button[state]}
            </button>
          </form>
        ) : (
          <Link href={`/${locale}/auth`} className={ACTION}>
            {subscription.button.available}
          </Link>
        )}

        <Agreement
          copy={page.agreement}
          locale={locale}
          className="mt-4 text-xs text-muted-foreground"
        />
      </div>
    </main>
  );
}

function Tick() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 7 7"
      fill="currentColor"
      shapeRendering="crispEdges"
      className="size-4 shrink-0 text-success"
    >
      <path d="M0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2z" />
      <path d="M3 4h1v1H3zM4 3h1v1H4zM5 2h1v1H5zM6 1h1v1H6z" />
    </svg>
  );
}

export * from "./_metadata";
