export async function translate(text: string) {
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

  return data.translations[0].translatedText as string;
}
