import type { NextRequest } from "next/server";

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function hasLocale(locale: string): locale is Locale {
  return locales.some((supported) => supported === locale);
}

export function preferredLocale(request: NextRequest): Locale {
  const preferences = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((entry) => {
      const [tag, quality = "q=1"] = entry.trim().split(";");
      return {
        locale: tag.trim().toLowerCase().split("-")[0],
        quality: Number(quality.trim().slice(2)) || 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const preferred = preferences.find(({ locale }) => hasLocale(locale))?.locale;
  return preferred && hasLocale(preferred) ? preferred : defaultLocale;
}
