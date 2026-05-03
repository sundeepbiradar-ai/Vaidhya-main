const { Pool } = require('pg');
const Redis = require('ioredis');
const { database, redis } = require('../config');

const pool = new Pool(
  database.connectionString
    ? { connectionString: database.connectionString }
    : {
        host: database.host,
        port: database.port,
        user: database.user,
        password: database.password,
        database: database.database
      }
);

const redisClient = new Redis(redis.url);

pool.on('connect', () => {
  console.log('PostgreSQL pool connected');
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL error', error);
  process.exit(1);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (error) => {
  console.error('Redis error', error);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  redisClient
};
