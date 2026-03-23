import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported for "Transaction" mode in Supabase/PgBouncer
// If the user uses session mode, prefetch can be enabled. 
// Given the previous Prisma setup used ?pgbouncer=true, we assume transaction mode.
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
