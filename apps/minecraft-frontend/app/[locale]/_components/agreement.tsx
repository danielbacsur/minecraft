import { Fragment, type ReactNode } from "react";

import Link from "next/link";

const LINK = "underline underline-offset-4 hover:text-[rgb(70_88_115/0.7)]";

export function Agreement({
  copy,
  className,
}: {
  copy: { text: string; terms: string; privacy: string };
  className?: string;
}) {
  const slots: Record<string, ReactNode> = {
    terms: (
      <Link href="/terms" className={LINK}>
        {copy.terms}
      </Link>
    ),
    privacy: (
      <Link href="/privacy" className={LINK}>
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
