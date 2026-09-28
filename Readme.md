# Campus Coin

> **Make every coin count for more.**
> A full-stack student budget and expense tracking web application built with the MERN stack.

Campus Coin gives students one place to record income and expenses, plan budgets, review reports, export data and build better saving habits. It enforces realistic financial rules (income before expenses, expenses never exceeding income) and includes a complete administrator console for platform management.

**Team:** Alpha 5 — Aptech Learning

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Financial Rules](#financial-rules)
- [API Overview](#api-overview)
- [Security](#security)
- [Implementation Status](#implementation-status)
- [Roadmap](#roadmap)
- [Team](#team)

---

## Features

### Student
- Registration, email verification, login, password recovery
- Profile & settings (avatar, currency, theme, font size, notifications)
- Income & expense transactions with search, filters, pagination, soft delete and audit history
- **Monthly recurring income** that carries forward automatically and stays editable
- **Expense date range** (start/end date) with calculated total days
- Default and personal categories (create, edit, archive)
- Category budgets with start/end dates and a 50–99% alert threshold
- Reports: category breakdown, daily/weekly analysis, six-month trend, **CSV export**
- **CSV import** with preview, correction and explicit confirmation
- Rule-based saving tips, monthly insights and a **Money Coach**
- Notifications and bookmarks
- Fully responsive (mobile, tablet, desktop)

### Administrator
- Dashboard with platform statistics
- Student management (search, details, enable/disable, reset link, delete)
- Global categories, announcements, tip templates / insights
- Activity logs
- Admin profile & settings (name, picture, password, theme, font size, notifications)

### Public Website
- Home, Features, How It Works, About, FAQ, Sitemap, Privacy, Terms
- Website chatbot for visitor questions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3.1, React Router 6.28.2, Vite 6.0.7 |
| Charts / Icons | Recharts 2.15.0, Lucide React |
| Image export | html-to-image |
| Backend | Node.js ≥ 20, Express 4.21.2 |
| Database | MongoDB + Mongoose 8.9.7 |
| Validation | Zod 3.24.1 |
| Auth | jsonwebtoken + bcryptjs (HTTP-only cookie session) |
| Email | Nodemailer 6.9.16 (SMTP) |
| CSV | csv-parse 5.5.6 + Multer |

---

## Project Structure

```
campus-coin/
├── backend/
│   ├── config/            # MongoDB connection & environment config
│   ├── data/ scripts/     # Default categories, admin seed, 6-month demo data
│   ├── helpers/           # Auth middleware, validation, categorization, email
│   ├── models/            # Mongoose models
│   ├── routes/
│   │   ├── auth/          # Registration, login/session, password recovery, profile
│   │   ├── finance/       # Categories, transactions, budgets, reports, insights, imports
│   │   └── admin/         # Stats, users, categories, announcements, templates, logs
│   ├── services/finance/  # Financial calculations, rules, planning window, tips
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/    # Shared UI, layouts, sidebars, charts, chatbot
    │   ├── lib/           # API client, money/date helpers
    │   ├── pages/
    │   │   ├── public/    # Home, info pages, sitemap, 404
    │   │   ├── auth/      # Register, Login, VerifyEmail, Forgot/Reset Password
    │   │   ├── student/   # Dashboard, Transactions, Budgets, Reports, Coach, ...
    │   │   └── admin/     # Admin Dashboard, Users, Categories, Content, Logs, ...
    │   └── styles/        # Global, theme and component styles
    └── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js 20 or later
- MongoDB (local or MongoDB Atlas)

### Backend

```bash
cd backend
npm i
npm run seed:admin
npm run dev
```

### Frontend

Open a new CMD window:

```bash
cd frontend
npm i
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose | Required |
|---|---|---|
| `NODE_ENV` | `development` / `production` | Yes |
| `PORT` | Express port (default `5000`) | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `CLIENT_URL` | Allowed frontend origin (CORS) | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `COOKIE_SECURE` | Force secure cookies | No |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Email delivery | For real email |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Admin seed | For `seed:admin` |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api/v1` |

> Never commit `.env` files or real credentials. Use `.env.example` for placeholders only.

> Without SMTP configured, verification and reset links are returned as a development preview link.

---

## Available Scripts

| Package | Command | Description |
|---|---|---|
| Backend | `npm run dev` | Start API in watch mode |
| Backend | `npm start` | Start API normally |
| Backend | `npm run seed:admin` | Create admin account from env values |
| Backend | `npm run seed:demo` | Generate six months of demo data |
| Backend | `npm test` | Syntax & module import check |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run preview` | Preview production build |

---

## Financial Rules

| Rule | Behaviour |
|---|---|
| **Income first** | Expenses and budgets are blocked until at least one income entry exists. |
| **Expense limit** | An expense is rejected if monthly expenses would exceed monthly income. |
| **Budget period** | Only expenses dated between a budget's start and end date count toward it. |
| **Planning window** | Until the 15th, only the current month can be budgeted. After the 15th, the next month opens. Later months stay locked. |
| **Future-month lock** | Future months are disabled on Dashboard, Reports, Insights, Tips and Money Coach. |
| **Recurring income** | Recurring income is carried into following months automatically; each entry is editable. |
| **Expense duration** | Total days between start and end date are shown on the form and in the table. |

**Money storage:** all amounts are stored as integer minor units (e.g. PKR 1,250 → `125000`) to avoid floating-point errors.

**Monthly figures:**
- Balance = income − expenses
- Savings = max(0, balance)
- Savings rate = savings ÷ income × 100
- Budget used % = spent ÷ limit × 100

---

## API Overview

All endpoints are served under **`/api/v1`**.

| Family | Endpoints |
|---|---|
| Health | `GET /health` |
| Auth | `register`, `login`, `admin/login`, `me`, `logout`, `verify-email`, `resend-verification`, `forgot-password`, `reset-password` |
| Profile | `users/profile`, `users/profile/avatar`, `users/change-password` |
| Finance | `dashboard`, `reports`, `reports/export`, `transactions`, `transactions/:id`, `transactions/:id/history`, `categories`, `budgets` |
| Insights | `tips`, `tips/generate`, `tips/:id`, `insights`, `insights/generate`, `coach`, `bookmarks`, `bookmarks/toggle` |
| Notifications | `notifications`, `notifications/unread-count`, `notifications/read-all`, `notifications/:id`, `announcements` |
| Import | `imports/preview`, `imports/confirm` |
| Admin | `admin/stats`, `admin/profile`, `admin/users`, `admin/users/:id/details`, `admin/users/:id/status`, `admin/users/:id/reset`, `admin/categories`, `admin/announcements`, `admin/templates`, `admin/logs`, `admin/notifications` |

**CSV import format** — required headers: `date, description, amount, type, category` (max 2 MB, 500 rows).

---

## Security

- Passwords hashed with **bcryptjs** (cost factor 12)
- JWT session stored in the **`cc_session`** HTTP-only cookie (`sameSite=strict`, 7-day max age, secure in production)
- Role-based access: finance routes require `student`, admin routes use `requireAdmin`
- Session revocation via `sessionVersion`; disabled accounts cannot authenticate
- Email verification required before login; reset tokens expire in 30 minutes
- Zod request validation and per-user ownership checks on every query
- Transaction create/update/delete recorded in `TransactionAudit`
- CORS restricted to configured origins; internal errors never exposed to clients

---

## Implementation Status

| Feature | Status |
|---|---|
| Authentication, email verification, password reset | Complete |
| Transactions CRUD + audit, recurring income, expense date range | Complete |
| Categories, budgets, planning window, future-month lock | Complete |
| Reports + CSV export, CSV import | Complete |
| Saving tips, insights, Money Coach | Complete |
| Notifications, bookmarks | Complete |
| Admin module, admin profile & settings | Complete |
| Responsive UI, 6-month demo data script | Complete |
| Public website chatbot | Partially complete — interface done, AI responses under verification |
| End-to-end testing | Pending |

---

## Roadmap

- [ ] Complete end-to-end testing
- [ ] Finalize chatbot AI responses (API keys kept on backend only)
- [ ] PDF report export alongside CSV
- [ ] Google OAuth
- [ ] Public contact page
- [ ] Automated API/integration tests + CI
- [ ] Rate limiting and auth throttling
- [ ] Structured logging, monitoring, backups
- [ ] Move avatars to object storage

---

## Team

**Team Alpha 5** — Aptech Learning

| Member | Contribution |
|---|---|
| **Muhammad Umair Modi** | Routing, configuration, API client, server entry points, global styling, integration, deployment config, final merge & testing |
| **Ali Zeshan Khan** | Admin dashboard, admin profile & settings, sidebar & account card, global categories, announcements, tip templates, admin statistics |
| **Abdul Rafay** | Authentication, student profile/settings, transactions, categories, budgets, CSV import/export, tips, insights, Money Coach, notifications, bookmarks |
| **Muhammad Tauseef** | Public website pages, website chatbot, public components & responsive styling |

---

Made by Team Alpha 5