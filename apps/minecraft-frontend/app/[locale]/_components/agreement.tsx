import { Fragment, type ReactNode } from "react";

import Link from "next/link";

import type { Locale } from "@/utils/i18n";

const LINK = "underline underline-offset-4 hover:text-[rgb(70_88_115/0.7)]";

export function Agreement({
  copy,
  locale,
  className,
}: {
  copy: { text: string; terms: string; privacy: string };
  locale: Locale;
  className?: string;
}) {
  const slots: Record<string, ReactNode> = {
    terms: (
      <Link href={`/${locale}/terms`} className={LINK}>
        {copy.terms}
      </Link>
    ),
    privacy: (
      <Link href={`/${locale}/privacy`} className={LINK}>
        {copy.privacy}
      </Link>
    ),
  };

  return (
    <p className={className}>
      {copy.text.split(/(\{\w+\})/).map((part, index) => {
        const slot = slots[part.slice(1, -1)];

        if (!slot) return part;

        return <Fragment key={index}>{slot}</Fragment>;
      })}
    </p>
  );
}
