import type { NextRequest } from "next/server";

import { z } from "zod";

import { auth } from "@minecraft/auth/server";

import { translate } from "./_utils/translate";

const Query = z.object({
  query: z.string().min(1).max(1000),
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

  return Response.json({ english });
}
