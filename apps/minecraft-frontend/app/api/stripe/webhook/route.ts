import type { NextRequest } from "next/server";

import { eq, postgres, schema } from "@minecraft/postgres";
import { stripe, toRow, type Stripe } from "@minecraft/stripe";

import { BadRequest, withErrors } from "@/errors";

export const POST = withErrors(async (request: NextRequest) => {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    throw new BadRequest("Missing Stripe signature header.");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    throw new BadRequest("Stripe signature verification failed.");
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = await stripe.subscriptions
        .retrieve(event.data.object.id)
        .catch(() => event.data.object);

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const [user] = await postgres
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.customerId, customerId));

      if (!user) break;

      const row = toRow(user.id, subscription);

      await postgres
        .insert(schema.subscriptions)
        .values(row)
        .onConflictDoUpdate({
          target: schema.subscriptions.subscriptionId,
          set: row,
        });

      break;
    }
  }

  return new Response(null, { status: 200 });
});
