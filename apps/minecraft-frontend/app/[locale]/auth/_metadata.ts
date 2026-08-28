import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@/utils/i18n";

import { getDictionary } from "./_dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/auth">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return dictionary.page.metadata;
}
