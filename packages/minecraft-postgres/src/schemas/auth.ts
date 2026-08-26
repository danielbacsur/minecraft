import {
  bigint,
  boolean,
  index,
  integer,
  snakeCase,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const auth = snakeCase.schema("auth");

// prettier-ignore
export const users = auth.table("users", {
  id: uuid().primaryKey().defaultRandom(),

  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),

  isAnonymous: boolean().default(false),
  lastLoginMethod: text(),
  customerId: text().unique(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

// prettier-ignore
export const sessions = auth.table("sessions", {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),

  token: text().notNull().unique(),
  expiresAt: timestamp().notNull(),

  ipAddress: text(),
  userAgent: text(),
  
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index().on(table.userId)
]);

// prettier-ignore
export const accounts = auth.table("accounts", {
  id: uuid().primaryKey().defaultRandom(),

  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),

  accountId: text().notNull(),
  providerId: text().notNull(),

  accessToken: text(),
  accessTokenExpiresAt: timestamp(),
  
  refreshToken: text(),
  refreshTokenExpiresAt: timestamp(),

  idToken: text(),

  scope: text(),
  password: text(),

  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index().on(table.userId)
]);

// prettier-ignore
export const verifications = auth.table("verifications", {
  id: uuid().primaryKey().defaultRandom(),
  
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index().on(table.identifier)
]);

// prettier-ignore
export const rateLimits = auth.table("rate_limits", {
  id: uuid().primaryKey().defaultRandom(),

  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint({ mode: "number" }).notNull(),
});
