import type { NextRequest } from "next/server";

export const locales = [
  "en",
  "de",
  "es",
  "ar",
  "zh-cn",
  "ja",
  "ko",
  "hi",
  "ru",
  "th",
] as const;

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
        locale: tag.trim().toLowerCase(),
        quality: Number(quality.trim().slice(2)) || 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const preference of preferences) {
    const exact = locales.find(
      (locale) => locale.toLowerCase() === preference.locale,
    );
    if (exact) return exact;

    const language = preference.locale.split("-")[0];
    const fallback = locales.find(
      (locale) => locale.toLowerCase().split("-")[0] === language,
    );
    if (fallback) return fallback;
  }

  return defaultLocale;
}
