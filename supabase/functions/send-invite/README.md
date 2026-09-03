# send-invite

Edge Function that sends a secure, tokenized project invitation email.

## Flow

1. An authenticated **project manager** POSTs `{ projectId, email, role }`.
2. The function generates a 256-bit token and calls the SQL RPC
   `create_project_invitation` **as the caller** — the RPC enforces that the
   caller manages the project (so no service-role key lives in this function).
3. Only the token's SHA-256 hash is stored; the raw token goes into the email
   link `${SITE_URL}/accept-invite?token=<raw>`.
4. Email is sent via **Brevo** when `BREVO_API_KEY` is set, otherwise the
   function runs in **dev mode** (logs + returns `devInviteUrl`).

## Responses

| Status | Body |
| --- | --- |
| 200 | `{ status: "invited", email, userExists, devInviteUrl? }` |
| 200 | `{ status: "already_member", email }` |
| 400 | `{ error }` (bad input) |
| 401 | `{ error }` (no Authorization header) |
| 403 | `{ error, code: "42501" }` (caller is not a manager) |
| 502 | `{ error }` (invite created but email send failed) |

## Local development

```bash
# (Docker Desktop must be running; this machine needs DOCKER_HOST pointed local)
export DOCKER_HOST=unix:///Users/<you>/.docker/run/docker.sock
supabase functions serve send-invite          # dev mode (no BREVO_API_KEY)
deno test supabase/functions/send-invite/lib.test.ts   # unit tests for pure helpers
```

## Deploy

```bash
supabase functions deploy send-invite
supabase secrets set BREVO_API_KEY=... EMAIL_FROM=... EMAIL_FROM_NAME=ProjectMap SITE_URL=https://your-app.vercel.app
```
