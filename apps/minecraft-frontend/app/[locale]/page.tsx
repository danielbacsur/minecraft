import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@/utils/i18n";
import { alternates } from "@/utils/metadata";

import { Client } from "./_components/client";
import { getDictionary } from "./_dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return { alternates: alternates(locale) };
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return <Client dictionary={dictionary.page} locale={locale} />;
}
