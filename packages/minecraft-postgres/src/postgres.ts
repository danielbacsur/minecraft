import { drizzle } from "drizzle-orm/neon-http";

export const postgres = drizzle(process.env.POSTGRES_URL as string);
