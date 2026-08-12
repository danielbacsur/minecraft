import { drizzle } from "drizzle-orm/neon-http";

import { relations } from "./relations";

export const postgres = drizzle(process.env.POSTGRES_URL as string, {
  relations,
});
