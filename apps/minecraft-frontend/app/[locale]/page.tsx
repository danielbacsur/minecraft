import { notFound } from "next/navigation";

import { hasLocale } from "@/utils/i18n";

import { Client } from "./_components/client";
import { getDictionary } from "./_dictionaries";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return <Client dictionary={dictionary.page} locale={locale} />;
}
