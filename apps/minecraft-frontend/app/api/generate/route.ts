import type { NextRequest } from "next/server";

import { z } from "zod";

import { auth } from "@minecraft/auth/server";
import { search } from "@minecraft/corpus";

import { normalize } from "./_utils/normalize";
import { translate } from "./_utils/translate";

const Query = z.object({
  query: z.string().max(1000).transform(normalize).pipe(z.string().min(1)),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Query.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  const english = await translate(parsed.data.query);
  const [first] = await search(english, { limit: 1 });

  if (!first) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  return Response.json({ id: first.id });
}
