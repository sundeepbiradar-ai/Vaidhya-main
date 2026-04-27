# Hospital Comparison Web App

A web application for patients to discover, compare, and book hospitals and healthcare services.

## Tech Stack
- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React.js
- **Database**: PostgreSQL
- **Authentication**: JWT

## Project Structure
- `backend/` - API server with authentication and business logic
- `frontend/` - React web application
- `database/` - Database schemas and migrations
- `docs/` - Documentation

## MVP Features
- User authentication (register/login)
- Hospital search and listing
- Hospital details and comparison
- Basic booking system

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+

### Installation
1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```
4. Set up database (see database/README.md)
5. Start the backend server:
   ```bash
   cd backend && npm start
   ```
6. Start the frontend:
   ```bash
   cd frontend && npm start
   ```
### Optional root commands
If you want to run commands from the repository root, use:
```bash
npm run start:backend
npm run start:frontend
npm run start:all
npm run stop:all
npm run build:frontend
```
## API Documentation
See `docs/api.md` for detailed API specifications.

## Contributing
Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.