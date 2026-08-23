import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export type { Stripe };

function at(seconds: number | null | undefined) {
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

export function toRow(userId: string, subscription: Stripe.Subscription) {
  const [item] = subscription.items.data;

  return {
    userId,

    plan: item.price.lookup_key ?? "unlimited",

    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    subscriptionId: subscription.id,

    status: subscription.status,

    periodStart: at(item.current_period_start),
    periodEnd: at(item.current_period_end),

    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: at(subscription.canceled_at),
    endedAt: at(subscription.ended_at),
  };
}
