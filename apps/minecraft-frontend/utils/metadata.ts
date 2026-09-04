import type { Metadata } from "next";

import { defaultLocale, locales, type Locale } from "@/utils/i18n";

export const origin = "https://minecraft.danielbacsur.dev";

export function alternates(locale: Locale, path = ""): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,

    languages: {
      ...Object.fromEntries(locales.map((code) => [code, `/${code}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
