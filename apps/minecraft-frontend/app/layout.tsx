import localFont from "next/font/local";

import "./globals.css";

const minecraft = localFont({
  src: "./minecraft.woff2",
  variable: "--font-minecraft",
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={minecraft.variable}>
      <body>{children}</body>
    </html>
  );
}

export { metadata } from "./metadata";
