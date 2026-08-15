# Expense Tracker — Frontend

A modern, professional frontend for the **Expense Tracker API** (FastAPI). It is a
fully connected single-page application — every screen reads and writes real data
through the backend REST API. There is no fake or hardcoded data.

## Features

- JWT authentication (register, login, logout, session restore)
- Dashboard with balance / income / expense / transaction count
- Charts: income vs expense (area), expense by category (donut), monthly spending (bar)
- Full transaction CRUD with a confirmation dialog for deletion
- Backend filtering (`GET /transactions/filter`) plus client-side search
- Responsive layout — sidebar becomes a mobile drawer, the table becomes cards
- Polished dark mode, skeletons, empty/error states, toasts, subtle animations
- Accessibility: semantic HTML, labels, focus rings, keyboard-friendly dialogs

## Technology Stack

| Tool            | Purpose                        |
| --------------- | ------------------------------ |
| React 18        | UI library                     |
| Vite 6          | Build tool / dev server        |
| Tailwind CSS 4  | Styling (design system in CSS) |
| React Router 7  | Routing                        |
| Axios           | HTTP client (central instance) |
| Framer Motion   | Animations                     |
| Recharts 3      | Charts                         |
| Lucide React    | Icons                          |

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- The Expense Tracker API running on `http://127.0.0.1:8000` (or elsewhere)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example file and adjust the API URL if needed:

```bash
cp .env.example .env
```

| Variable        | Description                          | Example                    |
| --------------- | ------------------------------------ | -------------------------- |
| `VITE_API_URL`  | Base URL of the FastAPI backend      | `http://127.0.0.1:8000`    |

Only `VITE_*` variables are safe to use — they are exposed to the browser.
Never put backend secrets (`SECRET_KEY`, `DATABASE_URL`) in the frontend.

### Development

```bash
npm run dev
```

Open `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

The build output goes to `dist/`.

### Verification (optional)

With the dev server and the backend running, a headless browser script walks
through register → login → dashboard → CRUD → filters → dark mode → mobile:

```bash
npm install -D playwright-core
npx playwright install firefox        # or set PLAYWRIGHT_FIREFOX_PATH
node scripts/e2e-verify.mjs
```

`scripts/screenshots.mjs` captures light/dark, desktop/mobile screenshots of
every page into `/tmp/opencode/`.

## Routes

| Route                      | Description                          | Access          |
| -------------------------- | ------------------------------------ | --------------- |
| `/`                        | Redirects to dashboard or login      | Public          |
| `/login`                   | Log in                               | Public          |
| `/register`                | Create an account                    | Public          |
| `/dashboard`               | Overview: stats, charts, recent      | Authenticated   |
| `/transactions`            | List, search, filter, manage         | Authenticated   |
| `/transactions/new`        | Create a transaction                 | Authenticated   |
| `/transactions/:id/edit`   | Edit a transaction                   | Authenticated   |
| `/profile`                 | Account details + logout             | Authenticated   |

## Backend API Integration

The frontend expects the following endpoints on the backend:

```
POST   /auth/register            JSON   { username, email, password }
POST   /auth/login               form   username + password (OAuth2)
GET    /users/me                 bearer token

POST   /transactions             JSON   { title, amount, type, category, date }
GET    /transactions             bearer token
GET    /transactions/filter      ?type&category&minimum_amount&maximum_amount
GET    /transactions/:id         bearer token
PUT    /transactions/:id         JSON   partial update
DELETE /transactions/:id         bearer token
```

Notes:

- Login uses OAuth2 form data (`application/x-www-form-urlencoded`), matching
  FastAPI's `OAuth2PasswordRequestForm`.
- `type` is `"income"` or `"expense"`; `amount` must be positive; `date` is `YYYY-MM-DD`.
- Ownership comes from the JWT — the frontend never sends `owner_id`.

## Project Structure

```
src/
├── components/
│   ├── ui/            Button, Input, Select, Modal, ConfirmDialog, Toast,
│   │                  Card, Skeleton, Spinner, EmptyState, ErrorState
│   ├── layout/        Sidebar, Header
│   ├── dashboard/     StatCard, recent transactions
│   ├── transactions/  Table rows, mobile cards, form, filter panel, view dialog
│   ├── charts/        Area, donut, bar charts + shared chart theme
│   └── common/        Logo, Avatar, PageTransition
├── pages/             Login, Register, Dashboard, Transactions,
│                      AddTransaction, EditTransaction, Profile
├── layouts/           DashboardLayout (sidebar + header + content)
├── services/          api.js (axios instance), authApi.js, transactionApi.js
├── context/           AuthContext, ThemeContext, ToastContext
├── hooks/             useAuth, useTheme, useToast, useTransactions
├── routes/            ProtectedRoute
└── utils/             formatCurrency, formatDate, constants, errors, statistics
```

## Design Notes

- Neutral warm-gray foundation with muted indigo / emerald / rose accents.
- Colors are used for small highlights (icons, badges, charts) — never huge blocks.
- Typography: Inter Variable, with a clear heading hierarchy.
- Animations are short (150–250 ms) and purposeful; nothing bounces or flashes.