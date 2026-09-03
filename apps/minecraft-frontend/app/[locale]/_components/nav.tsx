import type { ReactNode } from "react";

import Link from "next/link";

import { LuArrowLeft } from "react-icons/lu";

import type { Locale } from "@/utils/i18n";

const LINK =
  "flex h-11 items-center rounded-full px-3 text-[13px] tracking-[0.01em] text-[rgb(70_88_115/0.5)] transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.9)] motion-reduce:transition-none";

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
    <nav className="pointer-events-auto fixed end-5 top-5 z-10 flex items-center gap-0.5">
      <Link href={`/${locale}/pricing`} className={LINK}>
        {copy.pricing}
      </Link>

      {!registered && (
        <Link href={`/${locale}/auth`} className={LINK}>
          {copy.signIn}
        </Link>
      )}

      <span className="mx-1.5 h-5 w-px bg-[rgb(70_88_115/0.14)]" />

      {children}
    </nav>
  );
}

export function Back({ copy, locale }: { copy: string; locale: Locale }) {
  return (
    <Link
      href={`/${locale}`}
      className={`pointer-events-auto fixed start-5 top-5 z-10 animate-emerge gap-2 motion-reduce:animate-none ${LINK}`}
    >
      <LuArrowLeft className="size-4 rtl:-scale-x-100" />
      <span>{copy}</span>
    </Link>
  );
}
