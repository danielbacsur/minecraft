import { randomUUID } from "node:crypto";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import {
  anonymous,
  customSession,
  lastLoginMethod,
  oAuthProxy,
} from "better-auth/plugins";

import { and, eq, postgres, schema } from "@minecraft/postgres";

const options = {
  user: {
    additionalFields: {
      customerId: { type: "string", required: false, input: false },
    },
  },

  plugins: [
    anonymous({
      generateRandomEmail: () => `${randomUUID()}@anonymous.invalid`,
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await postgres
          .update(schema.generations)
          .set({ userId: newUser.user.id })
          .where(eq(schema.generations.userId, anonymousUser.user.id));
      },
    }),

    lastLoginMethod({ storeInDatabase: true }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  database: drizzleAdapter(postgres, {
    usePlural: true,
    provider: "pg",
    schema,
  }),

  baseURL: {
    allowedHosts: [
      "*.vercel.app",
      "localhost:3000",
      "minecraft.danielbacsur.dev",
    ],

    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },

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

  user: options.user,

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
  },

  plugins: [
    ...options.plugins,

    customSession(async ({ session, user }) => {
      if (user.isAnonymous) return { session, user, subscription: null };

      const [subscription] = await postgres
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.userId, user.id),
            eq(schema.subscriptions.status, "active"),
          ),
        );

      return { session, user, subscription: subscription ?? null };
    }, options),

    oAuthProxy({
      productionURL: process.env.OAUTH_PRODUCTION_URL,
      secret: process.env.OAUTH_PROXY_SECRET,
    }),

    nextCookies(),
  ],
});

export const { GET, POST } = toNextJsHandler(auth);
