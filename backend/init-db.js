const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  // Connect directly to hospital_db
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'password',
    database: 'hospital_db'
  });

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