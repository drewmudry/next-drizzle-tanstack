import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create the connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Create the database instance
export const db = drizzle(client);

// Export the client for manual queries if needed
export { client }; 