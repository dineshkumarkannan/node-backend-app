# Node Todo Backend App

A beginner-friendly Node.js backend application for learning authentication, REST APIs, PostgreSQL, Prisma ORM, and Docker.

## What is included?

- Node.js with ES modules
- Express.js HTTP server
- PostgreSQL database
- Prisma ORM 7
- Prisma PostgreSQL driver adapter
- JWT authentication
- `bcryptjs` password hashing
- Docker and Docker Compose
- Static frontend files in `public/`
- REST examples in [`test.rest`](./test.rest)

## How the application works

```text
Browser / REST Client
        |
        v
   Express Server :8383
        |
        +--> /auth/*  --> Register/Login --> bcrypt + JWT
        |
        +--> /todos/* --> JWT middleware --> User-owned todo queries
                                      |
                                      v
                         Prisma Client + PrismaPg adapter
                                      |
                                      v
                           PostgreSQL :5432
```

The frontend files are served from `public/`, while API routes are handled by Express.

## Project structure

```text
.
├── Dockerfile                 # Builds the application image
├── docker-compose.yaml        # Runs the app and PostgreSQL together
├── package.json               # Dependencies and npm scripts
├── prisma.config.ts           # Prisma CLI configuration
├── prisma/
│   └── schema.prisma          # Database models and relationships
├── src/
│   ├── server.js              # Express server and route registration
│   ├── prismaClient.js        # Prisma Client and PostgreSQL adapter setup
│   ├── db.js                  # Old SQLite learning file; no longer used by routes
│   ├── middlewares/
│   │   └── auth_middleware.js # Verifies JWTs for protected routes
│   ├── routes/
│   │   ├── auth_routes.js     # Register and login endpoints
│   │   └── todo_routes.js     # Todo CRUD endpoints
│   └── generated/prisma/      # Generated Prisma Client; ignored by Git
├── public/                    # Static frontend files
└── test.rest                  # REST Client requests for manual testing
```

## Prerequisites

Install the following before starting:

- Node.js 24 or a compatible version
- npm
- Docker Desktop with Docker Compose
- VS Code REST Client extension, optional, for running `test.rest`

## First-time local setup

### 1. Clone the project

```bash
git clone <repository-url>
cd node-backend-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the project root. Do not commit this file.

```env
JWT_SECRET=replace-with-a-local-secret
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nodetodoapp"
```

This URL is for commands running directly on your computer. The Docker app uses `db` as the database hostname instead of `localhost`.

### 4. Start PostgreSQL

Start only the database container first:

```bash
docker compose up -d db
```

Check that PostgreSQL is running:

```bash
docker compose ps
```

### 5. Validate the Prisma schema

```bash
npx prisma validate
```

The schema is located at [`prisma/schema.prisma`](./prisma/schema.prisma). It currently contains a `User` model and a related `Todos` model.

### 6. Create and apply the first migration

```bash
npx prisma migrate dev --name init
```

Migrations record database structure changes. Use a descriptive name for future changes, for example:

```bash
npx prisma migrate dev --name add_todo_created_at
```

### 7. Generate Prisma Client

```bash
npx prisma generate
```

This creates the generated client under `src/generated/prisma/`. The generated directory is ignored by Git, so every fresh checkout must run this command.

### 8. Start the API locally

```bash
npm run dev
```

The API runs at:

```text
http://localhost:8383
```

The `dev` script uses Node watch mode, so it automatically restarts after source-file changes.

## Running everything with Docker Compose

Make sure you have run `npm install` and `npx prisma generate` first. Then run:

```bash
docker compose up -d --build
```

The Compose app connects to PostgreSQL using:

```text
postgresql://postgres:postgres@db:5432/nodetodoapp
```

Inside Docker, `db` is the PostgreSQL service name. `localhost` would incorrectly refer to the Node app container itself.

View application logs:

```bash
docker compose logs -f app
```

View database logs:

```bash
docker compose logs -f db
```

Stop containers without deleting database data:

```bash
docker compose stop
```

Start stopped containers again:

```bash
docker compose start
```

Stop and remove containers and the Compose network:

```bash
docker compose down
```

Avoid `docker compose down -v` unless you intentionally want to delete the PostgreSQL volume and all local database data.

## API endpoints

### Health check

```http
GET /health
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "username": "test@test.mail",
  "password": "test@321"
}
```

The response contains a JWT token.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "test@test.mail",
  "password": "test@321"
}
```

Copy the returned token and use it with the todo endpoints. The current middleware expects the raw token in the `Authorization` header:

```http
Authorization: <token>
```

### Get todos

```http
GET /todos
Authorization: <token>
```

### Create a todo

```http
POST /todos
Authorization: <token>
Content-Type: application/json

{
  "task": "Learn Prisma"
}
```

### Update a todo

```http
PUT /todos/:id
Authorization: <token>
Content-Type: application/json

{
  "completed": true
}
```

### Delete a todo

```http
DELETE /todos/:id
Authorization: <token>
```

The authenticated user ID is taken from the JWT, so todo queries are scoped to the logged-in user.

## Prisma workflow

The usual development workflow is:

```text
Edit prisma/schema.prisma
          |
          v
npx prisma validate
          |
          v
npx prisma migrate dev --name describe_change
          |
          v
npx prisma generate
          |
          v
Use Prisma Client in the route files
```

Important Prisma files:

- `prisma/schema.prisma` defines models and relationships.
- `prisma/migrations/` stores database migration history.
- `prisma.config.ts` tells Prisma where the schema and migrations are located.
- `src/prismaClient.js` creates Prisma Client with the PostgreSQL adapter.
- `src/generated/prisma/` is generated code and should not be edited manually.

## Docker notes

- The `db` service runs PostgreSQL and stores data in the named `postgres-data` volume.
- The `app` service exposes port `8383`.
- The Compose file bind-mounts the project into `/app` for local development.
- The generated Prisma client must exist before the app starts.
- `.env` is used by local Prisma commands; Compose supplies the container database URL through its environment section.

## Troubleshooting

### `P1001: Can't reach database server`

Start PostgreSQL:

```bash
docker compose up -d db
```

For Prisma commands running on the host, use `localhost` in `DATABASE_URL`. For the app running inside Compose, use `db` as the hostname.

### `Cannot find module ... generated/prisma/client`

Generate the client and recreate the app container:

```bash
npx prisma generate
docker compose up -d --build --force-recreate app
```

### Port `8383` is already in use

Stop the local Node process or existing containers before starting another server:

```bash
docker compose stop app
```

### The app container exits

Read the logs:

```bash
docker compose logs app
```

## Current learning-project limitations

- Basic request validation is still limited.
- Error responses can be improved and centralized.
- The old `src/db.js` SQLite file remains for reference but is no longer used by the routes.
- There are no automated tests yet.
- The current JWT middleware expects a raw token instead of the conventional `Bearer <token>` format.
- Todo update and delete error handling can be improved for missing IDs.

These are intentionally left as future learning tasks rather than hidden from the project overview.
