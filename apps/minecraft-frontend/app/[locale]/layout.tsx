import { Geist } from "next/font/google";
import { notFound } from "next/navigation";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { direction, hasLocale } from "@/utils/i18n";

import { Studio } from "./_components/studio";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

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

export * from "./_metadata";
