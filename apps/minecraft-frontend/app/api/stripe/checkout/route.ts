import type { NextRequest } from "next/server";

import { auth } from "@minecraft/auth/server";
import { stripe } from "@minecraft/stripe";
import { eq, postgres, schema } from "@minecraft/postgres";

import { withErrors } from "@/errors";

export const POST = withErrors(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.isAnonymous) {
    return Response.redirect(new URL("/auth", request.url), 303);
  }

  const { user } = session;

  const { data } = await stripe.prices.list({
    lookup_keys: ["unlimited"],
    active: true,
    limit: 1,
  });

  if (!data[0]) {
    return Response.redirect(new URL("/pricing?error=plan", request.url), 303);
  }

  try {
    // prettier-ignore
    const customer = user.customerId ?? (await stripe.customers.create(
      { email: user.email, name: user.name, metadata: { userId: user.id } },
      { idempotencyKey: `customer:${user.id}` },
    )).id;

    await postgres
      .update(schema.users)
      .set({ customerId: customer })
      .where(eq(schema.users.id, user.id));

    // prettier-ignore
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price: data[0].id, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { userId: user.id } },
      success_url: new URL("/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}", request.url).toString(),
      cancel_url: new URL("/pricing", request.url).toString(),
      allow_promotion_codes: true,
    });

    return Response.redirect(checkout.url as string, 303);
  } catch (cause) {
    console.error(cause);

    return Response.redirect(
      new URL("/pricing?error=checkout", request.url),
      303,
    );
  }
});
