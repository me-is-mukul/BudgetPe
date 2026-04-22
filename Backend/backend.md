# BudgetPe Backend

Base URL: `http://localhost:5000/api`

---

## Auth

| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/auth/register` | `name, email, phoneNumber, password` | No |
| POST | `/auth/login` | `email, password` | No |
| GET | `/auth/me` | — | Bearer token |
| POST | `/auth/logout` | — | Bearer token |

## Messages

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/messages` | Bearer token |

---

> Add `Authorization: Bearer <token>` header for protected routes.
> Token is returned from `/auth/register` or `/auth/login`.
