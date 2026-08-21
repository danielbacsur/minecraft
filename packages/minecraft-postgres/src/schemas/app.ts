import { snakeCase, index, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";

export const app = snakeCase.schema("app");

// prettier-ignore
export const generations = app.table("generations", {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),

  query: text().notNull(),
  textureId: uuid().notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index().on(table.userId, table.createdAt)
]);
