import type { ReactNode } from "react";
import Link from "next/link";

export function Legal() {
  return (
    <nav className="mt-2.5 flex flex-wrap justify-center gap-x-3 text-center text-[11px] leading-4 text-[rgb(70_88_115/0.4)] [text-shadow:0_1px_0_rgb(255_255_255/0.7)]">
      <Link
        href="/terms"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Terms
      </Link>

      <Link
        href="/privacy"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Privacy
      </Link>

      <a
        href="mailto:support@danielbacsur.dev"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Contact
      </a>
    </nav>
  );
}

export function Document({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-152 px-5 py-14 sm:py-20">
      <header className="text-center">
        <h1 className="font-(family-name:--font-minecraft) text-[22px] leading-snug tracking-[0.01em] text-[rgb(70_88_115/0.85)] sm:text-[26px]">
          {title}
        </h1>

        <p className="mt-2.5 font-(family-name:--font-minecraft) text-[13px] text-[rgb(70_88_115/0.45)]">
          Last updated 25 August 2026
        </p>
      </header>

      <div className="mt-11 flex flex-col gap-6 text-justify text-[15px] leading-[1.8] text-[rgb(70_88_115/0.78)]">
        {children}
      </div>
    </main>
  );
}

export function Section({
  heading,
  id,
  children,
}: {
  heading: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-3">
      <h2 className="text-left font-(family-name:--font-minecraft) text-[15px] leading-snug tracking-[0.01em] text-[rgb(70_88_115/0.9)]">
        {heading}
      </h2>

      {children}
    </section>
  );
}

export function Mail() {
  return (
    <a
      href="mailto:support@danielbacsur.dev"
      className="underline underline-offset-4 transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
    >
      support@danielbacsur.dev
    </a>
  );
}
