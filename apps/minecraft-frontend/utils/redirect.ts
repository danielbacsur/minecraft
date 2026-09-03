import type { NextRequest } from "next/server";

import { hasLocale } from "./i18n";

export function redirect(request: NextRequest, path: string) {
  const remembered = request.cookies.get("locale")?.value;
  const locale = remembered && hasLocale(remembered) ? `/${remembered}` : "";

  const target = path === "/" ? locale || "/" : `${locale}${path}`;

  return Response.redirect(new URL(target, request.url), 303);
}
