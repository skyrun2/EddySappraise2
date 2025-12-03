# Server - Node.js Backend API

A production-ready Node.js backend server built with Express, TypeScript, and Prisma ORM.

## 🚀 Tech Stack

- **Runtime**: Node.js (>=18)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Prisma client setup
│   │   └── env.ts             # Environment variables
│   ├── controllers/           # Request handlers
│   │   └── user.controller.ts
│   ├── middlewares/           # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/                # API routes
│   │   ├── index.ts
│   │   └── user.routes.ts
│   ├── services/              # Business logic
│   │   └── user.service.ts
│   ├── utils/                 # Utility functions
│   │   ├── ApiError.ts
│   │   └── asyncHandler.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server bootstrap
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

From the **monorepo root**:
```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `apps/server` directory:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

### 3. Database Setup

Initialize Prisma and create the database:
```bash
cd apps/server
npm run prisma:migrate
npm run prisma:generate
```

## 📜 Available Scripts

From the **monorepo root**:

```bash
# Run server in development mode (from root)
turbo dev --filter=server

# Build the server (from root)
turbo build --filter=server

# Lint the server code (from root)
turbo lint --filter=server

# Type check (from root)
turbo check-types --filter=server
```

From the **server directory** (`apps/server`):

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Lint code
npm run lint

# Type check
npm run check-types
```

## 🌐 API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example Request

**Create User:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "password": "securepassword",
    "createdAt": "2025-12-03T01:00:00.000Z",
    "updatedAt": "2025-12-03T01:00:00.000Z"
  }
}
```

## 🏗️ Architecture

### Layered Architecture

1. **Routes** - Define API endpoints and apply middleware
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Contain business logic
4. **Database** - Prisma ORM for data access

### Error Handling

- Custom `ApiError` class for consistent error responses
- Global error handler middleware
- Async error catching with `asyncHandler` wrapper

### Middleware

- **Logger** - Logs all HTTP requests with duration
- **Error Handler** - Catches and formats errors
- **Validator** - Validates request data

## 🔧 Development

The server integrates seamlessly with the Turborepo monorepo:

- Extends shared TypeScript config from `@repo/typescript-config`
- Uses shared ESLint config from `@repo/eslint-config`
- Shares dev dependencies with the root workspace

## 📝 Notes

- **Password Hashing**: In production, hash passwords using bcrypt before storing
- **Authentication**: Add JWT-based authentication middleware
- **Validation**: Consider using Zod or Joi for robust validation
- **Testing**: Add Jest or Vitest for unit and integration tests

## 🚦 Next Steps

1. Set up password hashing (bcrypt)
2. Implement JWT authentication
3. Add input validation with Zod
4. Create additional models and relationships
5. Add unit and integration tests
6. Set up API documentation (Swagger/OpenAPI)
