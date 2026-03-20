# ISMS Governance Backend

## Overview
This backend is a secure, modular, and extensible REST API for an ISMS/ISO 27001 Governance Dashboard. It is built with Node.js, Express, and MySQL, and provides endpoints for user management, asset tracking, risk management, compliance, audits, and more. The backend is fully documented with Swagger/OpenAPI and supports JWT authentication.

---

## Key Features
- **Modular Express.js architecture** with route separation for all major resources
- **MySQL database** with normalized schema and referential integrity
- **JWT authentication** and role-based access control
- **Swagger UI** for interactive API documentation and testing
- **Seed scripts** for initial data population
- **CORS and security middleware** (Helmet, rate limiting)
- **Comprehensive error handling and logging**

---

## Major Changes & Migration (2026)
- **All database IDs migrated from UUID to INT AUTO_INCREMENT**
- **All foreign keys and backend code updated to use integer IDs**
- **Seed logic refactored to use auto-increment IDs and fetch inserted IDs for FKs**
- **Swagger docs updated: all `id` fields are now `type: integer`**
- **New endpoint:** `POST /api/v1/user_roles` for assigning roles to users
- **CORS and Swagger UI configuration improved for browser-based API testing**

---

## API Endpoints
- `/api/v1/auth` — Authentication (login, JWT)
- `/api/v1/users` — User CRUD
- `/api/v1/roles` — Role management
- `/api/v1/user_roles` — Assign roles to users
- `/api/v1/assets`, `/api/v1/risks`, `/api/v1/audits`, `/api/v1/compliance`, etc. — Domain resources
- `/api/v1/docs` — Swagger UI (OpenAPI 3.0)

---

## Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set DB credentials, JWT secret, etc.
3. **Setup the database:**
   - Run the SQL in `sql/schema.sql` to create all tables
   - (Optional) Run `utils/seed.js` to populate initial data
4. **Start the backend:**
   ```bash
   npm start
   # or
   node index.js
   ```
   - Visit [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

  ```

   # Prerequisites
   - Node.js v18+ (recommended v20+)
   - MySQL 8.x or MariaDB 10.5+
   - npm (Node Package Manager)

   ---

   # Environment Variables
   Create a `.env` file in the backend root. Required variables:

   | Variable           | Description                        |
   |--------------------|------------------------------------|
   | DB_HOST            | Database host                      |
   | DB_PORT            | Database port                      |
   | DB_USER            | Database username                  |
   | DB_PASSWORD        | Database password                  |
   | DB_NAME            | Database name                      |
   | JWT_SECRET         | Secret for JWT signing             |
   | FRONTEND_URL       | Allowed CORS origin (frontend URL) |

   ---

   # Database Schema Overview
   Key tables:
   - **users**: User accounts, authentication, and profile info
   - **roles**: Role definitions (admin, manager, user, etc.)
   - **user_roles**: Many-to-many mapping of users to roles
   - **assets, risks, audits, compliance, etc.**: Domain-specific resources
   - **permissions**: (Optional) Fine-grained access control
   All IDs are `INT AUTO_INCREMENT`. Foreign keys enforce referential integrity.

   ---

   # Authentication & Security
   - **JWT Authentication**: All protected endpoints require a Bearer token.
   - **Role-based Access Control**: User roles determine access to endpoints and features.
   - **Security Middleware**: Helmet, CORS, and rate limiting are enabled by default.

   ---

   # API Documentation
   - **Swagger UI** is available at `/api/v1/docs`.
   - Click the **Authorize** button and enter your Bearer token to test protected endpoints.
   - All endpoints, request/response schemas, and error codes are documented.

   ---

   # Seeding & Sample Data
   - Run `node utils/seed.js` to populate the database with sample users, roles, and demo data.
   - The seed script automatically links foreign keys using inserted IDs.

   ---

   # Development & Contribution
   ## Local Development
   - Start the backend: `npm start` or `node index.js`
   - Use tools like Postman or Swagger UI for API testing.

   ## Adding New Routes/Modules
   - Add a new file in `routes/` and register it in `index.js`.
   - Document new endpoints with Swagger JSDoc comments.

   ## Testing
   - (Optional) Add unit/integration tests in a `tests/` folder.

   ## Code Style
   - Follows standard JS/Node.js best practices.
   - Use Prettier or ESLint for formatting if desired.

   ---

   # Deployment
   - Set all environment variables in production.
   - Use a process manager (e.g., PM2) for reliability.
   - Secure your `.env` and database credentials.
   - (Optional) Add Dockerfile and docker-compose for containerized deployment.

   ---

   # Changelog
   ## 2026 Migration
   - Migrated all IDs from UUID to INT AUTO_INCREMENT
   - Updated all backend and seed logic for integer IDs
   - Improved Swagger/OpenAPI docs and CORS configuration
   - Added `/api/v1/user_roles` endpoint for role assignment

   ---

  - Confirm schema matches backend (all IDs are INT)

---

## Project Structure
```
backend/
  index.js
  package.json
  swagger.js
  config/
  logs/
  middleware/
  routes/
  sql/
  utils/
```

---

## Authors & License
- Developed by Andrew Laryea
- © 2026 ISMS Governance. All rights reserved.
- Licensed under the MIT License.
