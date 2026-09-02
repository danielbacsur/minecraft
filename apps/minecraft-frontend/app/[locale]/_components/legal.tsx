import Link from "next/link";

import type { Locale } from "@/utils/i18n";

export function Legal({
  copy,
  locale,
}: {
  copy: { terms: string; privacy: string; contact: string };
  locale: Locale;
}) {
  return (
    <nav className="mt-2.5 flex flex-wrap justify-center gap-x-3 text-center text-[11px] leading-4 text-[rgb(70_88_115/0.4)] [text-shadow:0_1px_0_rgb(255_255_255/0.7)]">
      <Link
        href={`/${locale}/terms`}
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        {copy.terms}
      </Link>

      <Link
        href={`/${locale}/privacy`}
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        {copy.privacy}
      </Link>

      <a
        href="mailto:support@danielbacsur.dev"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        {copy.contact}
      </a>
    </nav>
  );
}
