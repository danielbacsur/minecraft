import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasLocale } from "@/utils/i18n";

import { Back } from "../_components/nav";
import { Client } from "./_components/client";
import { getDictionary } from "./_dictionaries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/auth">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return dictionary.page.metadata;
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[locale]/auth">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const { from } = await searchParams;

  const dictionary = await getDictionary(locale);

  return (
    <>
      <Back copy={dictionary.page.back} locale={locale} />
      <Client
        dictionary={dictionary.page}
        locale={locale}
        reason={from === "quota" ? dictionary.page.reasons.quota : null}
      />
    </>
  );
}
