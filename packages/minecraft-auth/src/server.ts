import { randomUUID } from "node:crypto";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { postgres, schema } from "@minecraft/postgres";
import { betterAuth } from "better-auth";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import { anonymous, lastLoginMethod } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(postgres, {
    usePlural: true,
    provider: "pg",
    schema,
  }),

  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      prompt: "consent",
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },

    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  plugins: [
    anonymous({
      generateRandomEmail: () => `${randomUUID()}@anonymous.invalid`,
    }),

    lastLoginMethod({ storeInDatabase: true }),

    nextCookies(),
  ],
});

export const { GET, POST } = toNextJsHandler(auth);
