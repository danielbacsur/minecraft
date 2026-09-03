import { Cache } from "@minecraft/cache";

const cache = new Cache<string>("translate");

export async function translate(text: string) {
  const cached = await cache.get(text);
  if (cached !== undefined) return cached;

  const url = new URL(
    `https://translation.googleapis.com/language/translate/v2?${new URLSearchParams(
      { key: process.env.GOOGLE_TRANSLATE_API_KEY as string },
    )}`,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: "en", format: "text" }),
  });

  if (!response.ok) throw new Error();

  const { data } = await response.json();

  const translation = data.translations[0].translatedText as string;

  cache.set(text, translation);
  return translation;
}
