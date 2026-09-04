import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { direction, hasLocale, locales } from "@/utils/i18n";
import { origin } from "@/utils/metadata";

import { Studio } from "./_components/studio";
import { getDictionary } from "./_dictionaries";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const viewport: Viewport = {
  themeColor: "#e3edf2",
  colorScheme: "light",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const metadata = dictionary.layout.metadata;

  return {
    metadataBase: new URL(origin),

    title: {
      default: metadata.title,
      template: `%s — ${metadata.title}`,
    },

    description: metadata.description,
  };
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={direction(locale)}
      className={`${geistSans.variable} antialiased`}
    >
      <body className="bg-background font-sans wrap-break-word text-foreground">
        <Studio>{children}</Studio>

        <Analytics />
        <SpeedInsights />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
