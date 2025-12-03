# Server - Node.js Backend API

A production-ready Node.js backend server built with Express, TypeScript, Prisma ORM, and JWT authentication.

## 🚀 Tech Stack

- **Runtime**: Node.js (>=18)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
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
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── index.ts
│   │   ├── protected.routes.ts
│   │   └── user.routes.ts
│   ├── services/              # Business logic
│   │   └── user.service.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── express.d.ts
│   ├── utils/                 # Utility functions
│   │   ├── ApiError.ts
│   │   ├── asyncHandler.ts
│   │   └── jwt.util.ts
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
DIRECT_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
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

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get user by username
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Protected Routes (Require Authentication)
- `GET /api/protected/me` - Get authenticated user info

## 🔐 Authentication

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2025-12-03T10:00:00.000Z",
      "updatedAt": "2025-12-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Access Protected Routes

```bash
curl -X GET http://localhost:5000/api/protected/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
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
- **Auth Middleware** - Validates JWT tokens for protected routes

### Security Features

✅ **Password Hashing** - bcrypt with 10 salt rounds  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Token Expiration** - Configurable token lifetime  
✅ **Protected Routes** - Middleware-based route protection  
✅ **Secure Responses** - Passwords excluded from API responses

## 🔧 Development

The server integrates seamlessly with the Turborepo monorepo:

- Extends shared TypeScript config from `@repo/typescript-config`
- Uses shared ESLint config from `@repo/eslint-config`
- Shares dev dependencies with the root workspace

## 📝 Notes

- **Password Hashing**: All passwords are hashed using bcrypt before storage
- **JWT Tokens**: Tokens expire based on `JWT_EXPIRES_IN` environment variable
- **Protected Routes**: Use `authMiddleware` to protect any route
- **User Model**: Includes `id`, `username`, `email`, `password`, `createdAt`, `updatedAt`

## 🚦 Next Steps

1. ✅ ~~Set up password hashing (bcrypt)~~
2. ✅ ~~Implement JWT authentication~~
3. Add refresh token functionality
4. Implement rate limiting for auth endpoints
5. Add input validation with Zod
6. Create additional models and relationships
7. Add unit and integration tests
8. Set up API documentation (Swagger/OpenAPI)
