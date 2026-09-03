import Link from "next/link";

import type { Locale } from "@/utils/i18n";

const LINK =
  "transition-colors hover:text-foreground motion-reduce:transition-none";

export function Legal({
  copy,
  locale,
}: {
  copy: { terms: string; privacy: string; contact: string };
  locale: Locale;
}) {
  return (
    <nav className="mt-2 flex flex-wrap justify-center gap-x-4 text-center text-xs text-muted-foreground text-shadow-2xs text-shadow-white/70">
      <Link href={`/${locale}/terms`} className={LINK}>
        {copy.terms}
      </Link>

      <Link href={`/${locale}/privacy`} className={LINK}>
        {copy.privacy}
      </Link>

      <a href="mailto:support@danielbacsur.dev" className={LINK}>
        {copy.contact}
      </a>
    </nav>
  );
}
