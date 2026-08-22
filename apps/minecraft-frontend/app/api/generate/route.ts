import type { NextRequest } from "next/server";

import { isValidIP, normalizeIP } from "@better-auth/core/utils/ip";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { auth } from "@minecraft/auth/server";
import { search } from "@minecraft/corpus";
import { postgres, sql } from "@minecraft/postgres";

import {
  BadRequest,
  Capacity,
  NoMatch,
  QuotaExhausted,
  RateLimited,
  SearchFailed,
  TextureMissing,
  TranslationFailed,
  Unauthenticated,
  withErrors,
} from "@/errors";

import { normalize } from "./_utils/normalize";
import { simulate } from "./_utils/simulate";
import { texture } from "./_utils/texture";
import { translate } from "./_utils/translate";

const Query = z.object({
  query: z.string().max(1000).transform(normalize).pipe(z.string().min(1)),
});

const redis = Redis.fromEnv();

const overall = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, "1 m"),
  analytics: false,
  prefix: "generate:all",
});

const perIp = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: false,
  prefix: "generate:ip",
});

const perUser = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: false,
  prefix: "generate:user",
});

function ip(request: NextRequest) {
  const hop =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();

  if (!hop || !isValidIP(hop)) return "unknown";

  return normalizeIP(hop);
}

export const POST = withErrors(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw new Unauthenticated("Session could not be established.");
  }

  const { id: userId, isAnonymous } = session.user;

  const [overallLimit, perIpLimit, perUserLimit] = await Promise.all([
    overall.limit("all"),
    perIp.limit(ip(request)),
    perUser.limit(userId),
  ]);

  if (!overallLimit.success) {
    throw new Capacity("Generation capacity is temporarily exhausted.");
  }

  if (!perIpLimit.success) {
    throw new RateLimited("Request rate exceeded for this address.", {
      retryAfter: Math.max(
        1,
        Math.ceil((perIpLimit.reset - Date.now()) / 1000),
      ),
    });
  }

  if (!perUserLimit.success) {
    throw new RateLimited("Request rate exceeded for this account.", {
      retryAfter: Math.max(
        1,
        Math.ceil((perUserLimit.reset - Date.now()) / 1000),
      ),
    });
  }

  const body = Query.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    throw new BadRequest("Request body did not contain a usable query.");
  }

  const query = body.data.query;

  const english = await translate(query).catch(() => {
    throw new TranslationFailed("Prompt translation failed.");
  });

  const [match] = await search(english, { limit: 1 }).catch(() => {
    throw new SearchFailed("Skin search failed.");
  });

  if (!match) {
    throw new NoMatch("No skin matched the query.");
  }

  const png = await texture(match.id).catch(() => {
    throw new TextureMissing("Texture could not be fetched from the corpus.", {
      textureId: match.id,
    });
  });

  const [, consumed] = await postgres.batch([
    postgres.execute(
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))`,
    ),

    postgres.execute(sql`
      INSERT INTO app.generations (user_id, query, texture_id)
      SELECT ${userId}::uuid, ${query}::text, ${match.id}::uuid
      WHERE (
        SELECT count(*) FROM app.generations
        WHERE user_id = ${userId}::uuid
          AND (
            ${Boolean(isAnonymous)}::boolean
            OR created_at >= greatest(
                 date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc',
                 (SELECT created_at AT TIME ZONE 'utc' FROM auth.users WHERE id = ${userId}::uuid)
               )
          )
      ) < 3
      RETURNING id
    `),
  ]);

  const [generation] = consumed.rows;

  if (!generation) {
    throw new QuotaExhausted("Daily generation quota is already spent.", {
      scope: isAnonymous ? "anonymous" : "free",
    });
  }

  return new Response(simulate(png), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
});
