# Database Setup

## PostgreSQL Setup

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE hospital_comparison;
   ```

3. Create user:
   ```sql
   CREATE USER hospital_user WITH PASSWORD 'Sapna@1803';
   GRANT ALL PRIVILEGES ON DATABASE hospital_comparison TO hospital_user;
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following values:

```
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=Sapna@1803
DB_NAME=hospital_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
NODE_ENV=development
```

## Database Schema

See `schema.sql` for the complete database schema.