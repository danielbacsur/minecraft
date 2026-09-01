import type { ReactNode } from "react";

export function Document({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#e3edf2] px-5 py-14 font-sans sm:py-20">
      <div className="mx-auto w-full max-w-152">
        <header className="text-center">
          <h1 className="text-[22px] leading-snug tracking-[0.01em] text-[rgb(70_88_115/0.85)] sm:text-[26px]">
            {title}
          </h1>

          <p className="mt-2.5 text-[13px] text-[rgb(70_88_115/0.45)]">
            Last updated 25 August 2026
          </p>
        </header>

        <div className="mt-11 flex flex-col gap-6 text-justify text-[15px] leading-[1.8] text-[rgb(70_88_115/0.78)]">
          {children}
        </div>
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
      <h2 className="text-left text-[15px] leading-snug tracking-[0.01em] text-[rgb(70_88_115/0.9)]">
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
