import { NextRequest, NextResponse } from "next/server";

import { locales, preferredLocale } from "@/utils/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) return NextResponse.next();

  const redirect = request.nextUrl.clone();
  redirect.pathname = `/${preferredLocale(request)}${pathname}`;

  return NextResponse.redirect(redirect);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|resources).*)"],
};
