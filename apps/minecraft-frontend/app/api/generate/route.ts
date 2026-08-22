import type { NextRequest } from "next/server";

import { z } from "zod";

import { auth } from "@minecraft/auth/server";
import { search } from "@minecraft/corpus";

import {
  BadRequest,
  NoMatch,
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

export const POST = withErrors(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw new Unauthenticated("Session could not be established.");
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

  return new Response(simulate(png), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
});
