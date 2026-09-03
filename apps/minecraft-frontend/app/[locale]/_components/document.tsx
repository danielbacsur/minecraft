import type { ReactNode } from "react";

export function Document({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <h1 className="text-xl">{title}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Last updated 25 August 2026
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-6 text-justify text-base leading-relaxed">
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
    <section id={id} className="flex scroll-mt-6 flex-col gap-2">
      <h2 className="text-left text-base font-medium">{heading}</h2>

      {children}
    </section>
  );
}

export function Mail() {
  return (
    <a
      href="mailto:support@danielbacsur.dev"
      className="underline underline-offset-4 transition-colors hover:text-foreground motion-reduce:transition-none"
    >
      support@danielbacsur.dev
    </a>
  );
}
