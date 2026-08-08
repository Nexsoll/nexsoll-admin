/**
 * One-time helper: create PostgreSQL database named "admin".
 *
 * Usage:
 *   ADMIN_BOOTSTRAP_DATABASE_URL="postgresql://USER:PASS@HOST/maklin?sslmode=require" node scripts/create-admin-db.js
 *
 * Connects to an existing DB on the same server, then CREATE DATABASE admin.
 */
const { Client } = require('pg');

async function main() {
  const baseUrl = process.env.ADMIN_BOOTSTRAP_DATABASE_URL;

  if (!baseUrl) {
    throw new Error(
      'Set ADMIN_BOOTSTRAP_DATABASE_URL to an existing database on the same Postgres host.',
    );
  }

  const client = new Client({
    connectionString: baseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'admin'",
  );

  if (existing.rowCount === 0) {
    await client.query('CREATE DATABASE admin');
    console.log('Created database: admin');
  } else {
    console.log('Database already exists: admin');
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
