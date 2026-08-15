# Expense Tracker API

A personal expense tracker REST API built with FastAPI, SQLAlchemy, PostgreSQL and JWT authentication. Users can register, log in, and manage their own income/expense transactions. Every transaction is private: a user can only see, update or delete their own transactions.

## Tech Stack

- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM
- **PostgreSQL** — database
- **Pydantic v2** — request/response validation
- **JWT (PyJWT)** — authentication tokens
- **Passlib + Bcrypt** — password hashing
- **Pytest** — testing

## Project Structure

```text
expense-tracker/
│
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app: metadata, lifespan, router registration
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Settings loaded from .env
│   │   ├── database.py        # Engine, SessionLocal, Base, get_db dependency
│   │   └── security.py        # Password hashing + JWT creation
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   └── transaction.py     # Transaction model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py            # UserCreate, Token
│   │   ├── user.py            # UserResponse (never exposes the password hash)
│   │   └── transaction.py     # TransactionCreate/Update/Response
│   │
│   ├── dependencies/
│   │   ├── __init__.py
│   │   └── auth.py            # get_current_user dependency
│   │
│   └── routers/
│       ├── __init__.py
│       ├── auth.py            # /auth/register, /auth/login
│       ├── users.py           # /users/me
│       └── transactions.py    # Transaction CRUD + filtering
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py            # Test database + helpers
│   ├── test_auth.py
│   └── test_transactions.py
│
├── .env                       # Local environment variables (never committed)
├── .env.example               # Example environment variables
├── .gitignore
├── requirements.txt
├── pyproject.toml
└── README.md
```

The request flow is intentionally simple:

```text
Client → Router → Auth Dependency → SQLAlchemy Session → Model → PostgreSQL
```

There is no service or repository layer — database logic lives directly in the routers, which keeps the project easy to understand.

## Installation

1. Clone the repository and enter the project folder.

2. Install dependencies with uv (it creates the `.venv` automatically):

   ```bash
   uv sync
   ```

3. Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env
   ```

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://username:password@host:5432/database` |
| `SECRET_KEY` | Random secret used to sign JWT tokens. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | JWT signing algorithm, e.g. `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes (default `30`) |

Never commit the real `.env` file.

## PostgreSQL Configuration

1. Create a database, for example `expense_tracker`:

   ```sql
   CREATE DATABASE expense_tracker;
   ```

2. Put the connection string in `.env`:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
   ```

3. On application startup the tables are created automatically (`Base.metadata.create_all`). No migration tool is required for this project.

## Run Locally

```bash
uv run uvicorn app.main:app --reload
```

Then open:

- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Run Tests

Tests use an isolated in-memory SQLite database, so your real PostgreSQL database is never touched.

```bash
uv run pytest
```

If you prefer to run tests against a dedicated PostgreSQL test database:

```bash
TEST_DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker_test uv run pytest
```

## API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Log in and receive a JWT token |
| `GET` | `/users/me` | Yes | Current user's public info |
| `POST` | `/transactions` | Yes | Create a transaction |
| `GET` | `/transactions` | Yes | List own transactions |
| `GET` | `/transactions/filter` | Yes | Filter own transactions |
| `GET` | `/transactions/{id}` | Yes | Get one transaction |
| `PUT` | `/transactions/{id}` | Yes | Update one transaction |
| `DELETE` | `/transactions/{id}` | Yes | Delete one transaction |

### Filtering

All query parameters are optional and always scoped to the authenticated user:

```text
GET /transactions/filter?type=expense
GET /transactions/filter?category=Food
GET /transactions/filter?minimum_amount=100&maximum_amount=5000
GET /transactions/filter?type=expense&category=Food
```

## Authentication

1. Register a user:

   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "jayed", "email": "mdjayedgazi@gmail.com", "password": "1234"}'
   ```

2. Log in to get a token (form data):

   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=jayed&password=1234"
   ```

   Response:

   ```json
   {"access_token": "...", "token_type": "bearer"}
   ```

3. Use the token on protected endpoints:

   ```bash
   curl http://localhost:8000/transactions \
     -H "Authorization: Bearer <access_token>"
   ```

You can also click the green **Authorize** button in `/docs` and paste the token there.

### Security Notes

- Passwords are hashed with bcrypt; plain-text passwords are never stored.
- The API never returns `hashed_password`.
- `owner_id` is always taken from the authenticated user, never from the client.
- A user can never read, update or delete another user's transaction (returns 404).

## Render Deployment

1. Push the project to GitHub.

2. In the [Render Dashboard](https://dashboard.render.com), click **New + → Web Service** and connect your repository.

3. Configure the service:

   - **Build Command:** `curl -LsSf https://astral.sh/uv/install.sh | sh && uv pip install --system -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (Starter) is fine.

   The `$PORT` is provided by Render automatically — do not hardcode a port.

4. Add the environment variables in the Render dashboard (**Environment** tab):

   - `DATABASE_URL` — your PostgreSQL connection string (e.g. from Neon, Supabase or Render Postgres)
   - `SECRET_KEY` — a long random string
   - `ALGORITHM` — `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` — `30`

5. Deploy. Render installs the dependencies, starts uvicorn and exposes your API at the generated URL, e.g. `https://expense-tracker.onrender.com`. Swagger docs will be at `/docs`.