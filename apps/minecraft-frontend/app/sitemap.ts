import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/utils/i18n";
import { origin } from "@/utils/metadata";

const localized = ["", "/pricing"];
const english = ["/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...locales.flatMap((locale) =>
      localized.map((path) => ({
        url: `${origin}/${locale}${path}`,

        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((code) => [code, `${origin}/${code}${path}`]),
            ),

            "x-default": `${origin}/${defaultLocale}${path}`,
          },
        },
      })),
    ),

    ...english.map((path) => ({ url: `${origin}/${defaultLocale}${path}` })),
  ];
}
