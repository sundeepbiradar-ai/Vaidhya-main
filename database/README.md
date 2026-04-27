# Database Setup

## PostgreSQL Setup

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE hospital_comparison;
   ```

3. Create user:
   ```sql
   CREATE USER hospital_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE hospital_comparison TO hospital_user;
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://hospital_user:your_password@localhost:5432/hospital_comparison
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
NODE_ENV=development
```

## Database Schema

See `schema.sql` for the complete database schema.