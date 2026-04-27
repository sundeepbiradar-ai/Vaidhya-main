require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  // Connect directly to hospital_db, using environment variables for a fixed local development password
  const clientConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Sapna@1803',
        database: process.env.DB_NAME || 'hospital_db',
      };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    console.log('Connected to hospital_db');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('Schema created successfully');

    await client.end();
    console.log('Database initialization complete');

  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDatabase();