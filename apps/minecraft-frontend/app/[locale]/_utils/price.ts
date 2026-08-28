import { stripe, type Stripe } from "@minecraft/stripe";

import type { Locale } from "@/utils/i18n";

let promise: Promise<Stripe.Price | null> | undefined;

function getPrice() {
  promise ??= stripe.prices
    .list({ lookup_keys: ["unlimited"], active: true, limit: 1 })
    .then((prices) => prices.data[0] ?? null)
    .catch((cause) => {
      console.error(cause);
      promise = undefined;
      return null;
    });

  return promise;
}

export async function getPriceByLocale(locale: Locale) {
  const price = await getPrice();

  if (typeof price?.unit_amount !== "number") return null;

  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency.toUpperCase(),
    trailingZeroDisplay: "stripIfInteger",
  });

  const digits = format.resolvedOptions().maximumFractionDigits ?? 2;

  return format.format(price.unit_amount / 10 ** digits);
}
