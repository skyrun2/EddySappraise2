import 'dotenv/config'; // Import dotenv to load environment variables
import { defineConfig, env } from '@prisma/config';


export default defineConfig({
  // The main entry for your schema.
  schema: 'prisma/schema.prisma',

  // Where migrations should be generated.
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts', // Optional: script to run for "prisma db seed"
  },

  // The database URL.
  datasource: {
    url: env('DIRECT_URL'), // Type-safe env() helper to access DATABASE_URL from .env
  },
});