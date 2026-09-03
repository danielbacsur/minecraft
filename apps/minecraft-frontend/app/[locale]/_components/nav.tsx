import type { ReactNode } from "react";

import Link from "next/link";

import { LuArrowLeft } from "react-icons/lu";

import type { Locale } from "@/utils/i18n";

const LINK =
  "flex h-11 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none";

export function Nav({
  copy,
  locale,
  registered,
  children,
}: {
  copy: { pricing: string; signIn: string };
  locale: Locale;
  registered: boolean;
  children?: ReactNode;
}) {
  return (
    <nav className="pointer-events-auto fixed end-4 top-4 z-10 flex items-center gap-2">
      <Link href={`/${locale}/pricing`} className={LINK}>
        {copy.pricing}
      </Link>

      {!registered && (
        <Link href={`/${locale}/auth`} className={LINK}>
          {copy.signIn}
        </Link>
      )}

      <span className="mx-1 h-4 w-px bg-muted" />

      {children}
    </nav>
  );
}

export function Back({ copy, locale }: { copy: string; locale: Locale }) {
  return (
    <Link
      href={`/${locale}`}
      className={`pointer-events-auto fixed start-4 top-4 z-10 animate-emerge motion-reduce:animate-none ${LINK}`}
    >
      <LuArrowLeft className="size-4 rtl:-scale-x-100" />
      <span>{copy}</span>
    </Link>
  );
}
