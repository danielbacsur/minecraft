import Link from "next/link";

import { LuArrowLeft } from "react-icons/lu";

import type { Locale } from "@/utils/i18n";

export function Back({ copy, locale }: { copy: string; locale: Locale }) {
  return (
    <Link
      href={`/${locale}`}
      className="pointer-events-auto fixed start-4 top-4 z-10 flex h-11 animate-emerge items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:animate-none motion-reduce:transition-none"
    >
      <LuArrowLeft className="size-4 rtl:-scale-x-100" />
      <span>{copy}</span>
    </Link>
  );
}
