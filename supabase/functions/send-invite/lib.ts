// Pure, dependency-free helpers for the send-invite Edge Function.
// Kept separate from index.ts so they can be unit-tested with `deno test`
// without booting the HTTP handler or the Supabase runtime.

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Pragmatic email check (the database re-validates on insert).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['manager', 'member'] as const;

export type Role = (typeof ROLES)[number];

export interface InviteRequest {
  projectId: string;
  email: string;
  role: Role;
}

export interface BrevoEmail {
  sender: { email: string; name: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
}

/** 32 bytes of CSPRNG randomness, base64url-encoded without padding (43 chars). */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildInviteUrl(siteUrl: string, token: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return `${base}/accept-invite?token=${token}`;
}

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

export function isValidUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** Validates and normalizes the request body. Throws on invalid input. */
export function validateInviteRequest(body: unknown): InviteRequest {
  const b = (body ?? {}) as Record<string, unknown>;

  if (!isValidUuid(b.projectId)) {
    throw new Error('Invalid or missing projectId');
  }
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    throw new Error('Invalid or missing email');
  }
  const role = b.role === undefined || b.role === null || b.role === ''
    ? 'member'
    : b.role;
  if (!isValidRole(role)) {
    throw new Error('Invalid role (must be "manager" or "member")');
  }

  return { projectId: b.projectId as string, email, role };
}

export function buildBrevoEmail(opts: {
  toEmail: string;
  inviteUrl: string;
  projectName: string;
  inviterName?: string;
  fromEmail: string;
  fromName: string;
}): BrevoEmail {
  const { toEmail, inviteUrl, projectName, inviterName, fromEmail, fromName } =
    opts;
  const inviter = inviterName ? `${inviterName} invited you` : 'You have been invited';

  return {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: toEmail }],
    subject: `You've been invited to join ${projectName} on ProjectMap`,
    htmlContent: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0d47a1;">ProjectMap</h2>
        <p>${inviter} to join the project <strong>${projectName}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${inviteUrl}"
             style="background: #0d47a1; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none;">
            Accept invitation
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">
          Or paste this link into your browser:<br />
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px;">This invitation expires in 7 days.</p>
      </div>
    `.trim(),
  };
}
