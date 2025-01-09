import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_BELAMI!);
const db = drizzle({ client: sql });

export default db;

export type DrizzleClient = typeof db;