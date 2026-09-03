import type { NextRequest } from "next/server";

import { z } from "zod";

import { auth } from "@minecraft/auth/server";
import { and, eq, postgres, schema } from "@minecraft/postgres";

import {
  BadRequest,
  NotFound,
  SubscriptionRequired,
  Unauthenticated,
  withErrors,
} from "@/errors";
import { texture } from "@/utils/texture";

export const GET = withErrors(async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  });

  if (!session) {
    throw new Unauthenticated("Session could not be established.");
  }

  if (!session.subscription) {
    throw new SubscriptionRequired("Downloads require an active subscription.");
  }

  const id = z.uuid().safeParse(request.nextUrl.searchParams.get("id"));

  if (!id.success) {
    throw new BadRequest("The id parameter is not a valid UUID.");
  }

  const [generation] = await postgres
    .select({ textureId: schema.generations.textureId })
    .from(schema.generations)
    .where(
      and(
        eq(schema.generations.id, id.data),
        eq(schema.generations.userId, session.user.id),
      ),
    );

  if (!generation) {
    throw new NotFound("No generation with that id belongs to this account.");
  }

  const png = await texture(generation.textureId).catch(() => {
    throw new NotFound("The texture for that generation is missing.");
  });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${id.data}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
});
