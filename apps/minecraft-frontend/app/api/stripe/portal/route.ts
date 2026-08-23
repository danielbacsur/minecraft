import type { NextRequest } from "next/server";

import { auth } from "@minecraft/auth/server";
import { stripe } from "@minecraft/stripe";

import { withErrors } from "@/errors";

export const POST = withErrors(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user.customerId) {
    return Response.redirect(new URL("/pricing", request.url), 303);
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: session.user.customerId,
      return_url: new URL("/pricing", request.url).toString(),
    });

    return Response.redirect(portal.url, 303);
  } catch (cause) {
    console.error(cause);

    return Response.redirect(
      new URL("/pricing?error=portal", request.url),
      303,
    );
  }
});
