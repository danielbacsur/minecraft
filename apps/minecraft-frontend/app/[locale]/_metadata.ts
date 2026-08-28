import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale, locales } from "@/utils/i18n";

import { getDictionary } from "./_dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const metadata = dictionary.layout.metadata;

  return {
    title: {
      default: metadata.title,
      template: `%s — ${metadata.title}`,
    },
    description: metadata.description,
  };
}
