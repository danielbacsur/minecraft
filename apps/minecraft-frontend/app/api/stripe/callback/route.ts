import type { NextRequest } from "next/server";

import { auth } from "@minecraft/auth/server";
import { postgres, schema } from "@minecraft/postgres";
import { stripe, toRow } from "@minecraft/stripe";

import { withErrors } from "@/errors";
import { redirect } from "@/utils/redirect";

export const GET = withErrors(async (request: NextRequest) => {
  try {
    const id = request.nextUrl.searchParams.get("session_id");
    const session = await auth.api.getSession({ headers: request.headers });

    if (!id || !session) {
      return redirect(request, "/pricing");
    }

    const checkout = await stripe.checkout.sessions.retrieve(id, {
      expand: ["subscription"],
    });

    if (
      checkout.client_reference_id !== session.user.id ||
      !checkout.subscription ||
      typeof checkout.subscription === "string"
    ) {
      return redirect(request, "/pricing?error=callback");
    }

    const row = toRow(session.user.id, checkout.subscription);

    await postgres.insert(schema.subscriptions).values(row).onConflictDoUpdate({
      target: schema.subscriptions.subscriptionId,
      set: row,
    });

    return redirect(request, "/");
  } catch (cause) {
    console.error(cause);

    return redirect(request, "/pricing?error=callback");
  }
});
