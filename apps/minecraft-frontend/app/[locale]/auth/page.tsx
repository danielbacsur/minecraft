import { notFound } from "next/navigation";

import { hasLocale } from "@/utils/i18n";

import { Back } from "../_components/nav";
import { Client } from "./_components/client";
import { getDictionary } from "./_dictionaries";

export default async function Page({ params }: PageProps<"/[locale]/auth">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <>
      <Back copy={dictionary.page.back} locale={locale} />
      <Client dictionary={dictionary.page} locale={locale} />
    </>
  );
}

export * from "./_metadata";
