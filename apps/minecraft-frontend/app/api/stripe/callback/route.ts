import type { NextRequest } from "next/server";

import { auth } from "@minecraft/auth/server";
import { stripe, toRow } from "@minecraft/stripe";
import { postgres, schema } from "@minecraft/postgres";

import { withErrors } from "@/errors";

export const GET = withErrors(async (request: NextRequest) => {
  try {
    const id = request.nextUrl.searchParams.get("session_id");
    const session = await auth.api.getSession({ headers: request.headers });

    if (!id || !session) {
      return Response.redirect(new URL("/pricing", request.url), 303);
    }

    const checkout = await stripe.checkout.sessions.retrieve(id, {
      expand: ["subscription"],
    });

    if (
      checkout.client_reference_id === session.user.id &&
      checkout.subscription && typeof checkout.subscription !== "string" // prettier-ignore
    ) {
      const row = toRow(session.user.id, checkout.subscription);

      await postgres
        .insert(schema.subscriptions)
        .values(row)
        .onConflictDoUpdate({
          target: schema.subscriptions.subscriptionId,
          set: row,
        });
    }

    return Response.redirect(new URL("/pricing", request.url), 303);
  } catch (cause) {
    console.error(cause);

    return Response.redirect(
      new URL("/pricing?error=callback", request.url),
      303,
    );
  }
});
