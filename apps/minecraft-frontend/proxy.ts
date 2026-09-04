import { NextRequest, NextResponse } from "next/server";

import { hasLocale, preferredLocale, type Locale } from "@/utils/i18n";

const COOKIE = "locale";

const OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

function referrer(request: NextRequest): Locale | undefined {
  const referer = request.headers.get("referer");
  if (!referer || !URL.canParse(referer)) return undefined;

  const { host, pathname } = new URL(referer);
  if (host !== request.nextUrl.host) return undefined;

  const [segment] = pathname.split("/").filter(Boolean);
  return hasLocale(segment) ? segment : undefined;
}

function resolve(request: NextRequest): Locale {
  const referred = referrer(request);
  if (referred) return referred;

  const remembered = request.cookies.get(COOKIE)?.value;
  if (remembered && hasLocale(remembered)) return remembered;

  return preferredLocale(request);
}

export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const [segment] = segments;

  if (hasLocale(segment)) {
    const response = NextResponse.next();
    const landing = request.headers.get("sec-fetch-dest") === "document";

    if (landing && request.cookies.get(COOKIE)?.value !== segment) {
      response.cookies.set(COOKIE, segment, OPTIONS);
    }

    return response;
  }

  const locale = resolve(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${[locale, ...segments].join("/")}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, OPTIONS);
  response.headers.set("cache-control", "private, no-store");
  response.headers.set("vary", "cookie, referer, accept-language");

  return response;
}

export const config = {
  matcher: [
    "/((?!\\.well-known/|_next/|api/|resources/|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
