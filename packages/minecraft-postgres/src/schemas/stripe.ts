import {
  boolean,
  index,
  snakeCase,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";

export const stripe = snakeCase.schema("stripe");

// prettier-ignore
export const subscriptions = stripe.table("subscriptions", {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),

  plan: text().notNull(),

  customerId: text().notNull(),
  subscriptionId: text().notNull().unique(),

  status: text().notNull(),

  periodStart: timestamp({ withTimezone: true }),
  periodEnd: timestamp({ withTimezone: true }),

  cancelAtPeriodEnd: boolean().notNull().default(false),
  canceledAt: timestamp({ withTimezone: true }),

  endedAt: timestamp({ withTimezone: true }),
}, (table) => [
  index().on(table.userId)
]);
