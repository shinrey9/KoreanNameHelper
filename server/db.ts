import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool with timeouts and error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 10, // maximum number of clients in the pool
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });

// Test database connection with timeout
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    
    const connectionTest = pool.query('SELECT 1');
    
    await Promise.race([connectionTest, timeout]);
    console.log('✓ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}